# Salesient — AI Sales Assistant

## Overview

Salesient is an AI sales assistant called **Elie**, built by **Ram Krishna**, that connects with a variety of external services through [Composio](https://composio.dev) to help you manage files, search the web, and have intelligent conversations about your documents. It integrates machine learning and Retrieval Augmented Generation (RAG) throughout the entire stack to provide responses grounded in your actual business data rather than generic AI outputs.

The system uses **Google's Gemini models** for both the main conversation and for generating embeddings that power the RAG system. The backend is built on **Next.js with TypeScript**, uses **Drizzle ORM** to talk to a **PostgreSQL database** with the **pgvector** extension for storing and searching vector embeddings.

---

## Table of Contents

- [How Chat Works — End to End](#how-chat-works--end-to-end)
- [Backend Chat API — The Orchestration Layer](#backend-chat-api--the-orchestration-layer)
- [MCP Session & Composio Integration](#mcp-session--composio-integration)
- [System Prompt & Business Context](#system-prompt--business-context)
- [Tool Initialization — AI Agent Capabilities](#tool-initialization--ai-agent-capabilities)
- [AI Model Call with Streaming](#ai-model-call-with-streaming)
- [How Tool Calling Works](#how-tool-calling-works)
- [Streaming Protocol & Frontend Consumption](#streaming-protocol--frontend-consumption)
- [File Processing Pipeline](#file-processing-pipeline)
- [RAG — Retrieval Augmented Generation](#rag--retrieval-augmented-generation)
- [Memory System with Supermemory](#memory-system-with-supermemory)
- [Firecrawl — Web Scraping & Search](#firecrawl--web-scraping--search)
- [Frontend Chat Interface](#frontend-chat-interface)
- [Database Schema & Relationships](#database-schema--relationships)
- [Full End-to-End Flow](#full-end-to-end-flow)
- [Technical Gotchas & Design Choices](#technical-gotchas--design-choices)
- [Deployment & Environment](#deployment--environment)
- [What Could Be Improved](#what-could-be-improved)
- [Migration Notes (FastAPI)](#migration-notes-fastapi)

---

## How Chat Works — End to End

When a user types a message and hits send, the following chain of events occurs:

1. The **`ChatSection`** frontend component handles the UI, powered by a custom React hook called **`useStreamingChat`**, which manages message state, streaming responses, and file attachments.
2. If there's no active chat session, `createNewChat` is called to insert a new record in the `chat` table in PostgreSQL.
3. The user's message is immediately saved to the database via `addMessageToChat` — before the AI API is even called. The database is the source of truth.
4. A `POST` request is sent to **`api/chat/route.ts`**, the main backend endpoint that orchestrates everything.

---

## Backend Chat API — The Orchestration Layer

The chat route (`api/chat/route.ts`) is the core of the system (~873 lines). It handles:

1. **Authentication** — Validates the user session using the `better-auth` library.
2. **Authorization** — Confirms the requested chat belongs to the authenticated user.
3. **Message History** — Fetches all existing messages for the chat from PostgreSQL to pass as context to the AI model.

---

## MCP Session & Composio Integration

Salesient uses the **Model Context Protocol (MCP)**, provided by Composio, to allow the AI agent to interact with external integrations such as Google Drive, OneDrive, Salesforce, HubSpot, and more.

**How sessions work:**

- `getOrCreateCmpSession` manages sessions using a key based on `userId + chatId`.
- If no session exists, it calls Composio's experimental `toolRouter` API to create a new session for the user's email.
- Composio returns a URL and session ID used to establish a persistent MCP connection via `StreamableHTTPClientTransport`.
- `createMcpClient` from the AI SDK wraps the transport and exposes all available integration tools dynamically (e.g., `onedrive_download_file`, `googledrive_list_files`, `salesforce_create_lead`, `hubspot_get_contacts`).

> **Note:** You may see references to `nango` in older comments or variable names. The system has fully migrated to Composio for all integrations.

---

## System Prompt & Business Context

Before sending messages to the AI model, a detailed system prompt is constructed:

- **Timestamp** — Current UTC time is injected so the AI knows the current datetime.
- **Primary Context** — If the user has configured custom preferences (company details, product info, sales processes), they are inserted at the very top from the `userPreferences` table. The AI is instructed to always reference this context first.
- **Role Instructions** — Elie is defined as a sales assistant with access to CRMs, HRMs, file storage, and email systems through Composio tools.
- **Rules** — Never ask users for Composio entity IDs, always use tools for file handling, end every response with a call to `add_memory`.
- **Chain-of-Thought Prompting** — A structured reasoning process guides the AI: analyze query → check primary context → search memories → call tools → respond with value and a call to action.

---

## Tool Initialization — AI Agent Capabilities

After building the system prompt, all available tools are initialized. Tools are typed functions the AI can invoke, each with a description, Zod-validated input schema, and an execute function.

### Memory Tools
Created via `createMemoryTools` using **Supermemory**:
- `search_memories` — Retrieves relevant past conversation context.
- `add_memory` — Stores new insights. All memories are tagged with the user's ID for isolation.

### Discovery Tool
- `list_composio_tools` — Lets the AI discover what Composio integration tools are available before attempting to use them.

### Custom Built Tools

| Tool | Description |
|------|-------------|
| `firecrawl` | Scrapes web pages, returns clean Markdown content |
| `firesearch` | Searches the web via Firecrawl's search API |
| `global_rag_search` | Searches all of the user's indexed documents via vector similarity |
| `local_rag_search` | Searches within specific projects or files attached to the chat |
| `smart_file_reader` | Guides the AI on how to process files from cloud storage |
| `composio_file_processor` | Downloads, uploads to storage, extracts text, generates embeddings, and indexes files |

All of these tools, plus the dynamic MCP tools from Composio, are merged into a single `tools` object passed to `streamText`.

---

## AI Model Call with Streaming

Salesient uses `createUIMessageStream` from the AI SDK to stream responses token by token, making the UI feel fast and responsive.

**Configuration:**

- **Model:** `google/gemini-2.5-flash`
- **Temperature:** `0.5` (balanced creativity and focus)
- **Seed:** `98` (for reproducibility)
- **Thinking Config:** `thinkingBudget: 8192` tokens, `includeThoughts: true` — enables Gemini's internal chain-of-thought reasoning, streamed separately so the UI can show a "thinking" section.
- **Stop Condition:** `stepCountIs(50)` — prevents infinite tool call loops.

---

## How Tool Calling Works

When the AI decides to call a tool, the AI SDK parses the tool call from the model's response and executes the corresponding function automatically. Tool results are passed back to the model so it can incorporate them into its response. If a tool call fails, the AI sees the error and can try an alternative approach.

**Example flow for "download my OneDrive file report.pdf":**
1. Call `onedrive_list_files` or `onedrive_search` to find the file ID.
2. Call `smart_file_reader` to get processing instructions.
3. Call `onedrive_download_file` with the file ID.
4. Call `composio_file_processor` with the download response to process and index the file.

---

## Streaming Protocol & Frontend Consumption

The backend returns a line-based stream protocol. Each line has a type code and JSON payload:

| Type Code | Meaning |
|-----------|---------|
| `0` | Text delta (actual response text) |
| `2` | Reasoning delta (internal thinking) |
| `9` | Tool call information |
| `a` | Tool result information |

The `useStreamingChat` hook reads the response body using a `ReadableStream` reader, decodes chunks, and accumulates them into:
- `streamingContent` — displayed word by word
- `streamingReasoning` — shown in an expandable "thinking" section
- `streamingToolCalls` — shows which tools are being called and their results

When the stream finishes, the `onFinish` callback saves the complete assistant response (including all tool results) to the database.

---

## File Processing Pipeline

Processing a file from a cloud integration like OneDrive involves the following steps:

### Step 1 — User Mentions a File
User types something like "analyze my OneDrive file sales-report.xlsx". The AI may first call `list_composio_tools` to see available OneDrive capabilities.

### Step 2 — Find & Identify the File
The AI calls `onedrive_list_files` or `onedrive_search_files`. Composio handles OAuth authentication transparently. The search returns file metadata including the file ID.

### Step 3 — Smart File Reader Guidance
The AI calls `smart_file_reader` with the integration name, filename, and file ID. It returns instructions specific to that integration (e.g., call `onedrive_download_file` with `fileId` parameter).

### Step 4 — Download the File
The AI calls `onedrive_download_file`. Composio makes an authenticated request to the Microsoft Graph API. The response may contain the file as a direct buffer, base64 string, S3 URL, or nested in a `data`/`content` field.

### Step 5 — Process with Composio File Processor
The AI calls `composio_file_processor` with the full download response. This tool validates the user, checks for duplicates, and extracts the file buffer using multiple fallback strategies.

### Step 6 — Upload to Storage
The buffer is uploaded to **MinIO** (S3-compatible object storage) at a path like `userId/files/timestamp-filename`.

### Step 7 — Extract Text Content
Text is extracted based on file type:

| File Type | Method |
|-----------|--------|
| PDF | Gemini OCR (`performOcrWithGemini`) |
| Images (JPG, PNG, WebP, GIF) | Gemini Vision OCR |
| DOCX | `mammoth` library |
| PPTX | Unzip → parse slide XML |
| XLSX/XLS | `xlsx` library → CSV conversion |
| CSV | `papaparse` |
| TXT/MD | Direct buffer decode |

### Step 8 — Generate Embeddings
Text is chunked using `chunkText` (default: 1024 chars, 256 char overlap). Each chunk is embedded using **`gemini-embedding-001`** to produce 768-dimensional vectors, optimized with `taskType: SEMANTIC_SIMILARITY`.

### Step 9 — Store in Database
A `fileUpload` record is created in PostgreSQL. Then `documentChunk` records are inserted — one per chunk — each containing the chunk text and its 768-dimensional embedding vector stored using **pgvector**.

The file is now fully processed and searchable through the RAG system.

---

## RAG — Retrieval Augmented Generation

### Global RAG Search
When the AI needs to answer a question about a user's documents:
1. Generates an embedding vector for the query.
2. Queries the `documentChunk` table using pgvector's cosine distance operator (`<=>`).
3. Returns the top-K most similar chunks (default: 5, max: 50) above a minimum similarity threshold (0.5).
4. Formats results as context with source metadata and returns them to the AI model.

The AI grounds its response in the retrieved content rather than hallucinating. Semantic search means querying "revenue" can match chunks mentioning "sales figures" or "income."

### Local RAG Search
Created by `createLocalRagTool`, this scopes the search to specific projects or files attached to the current chat. It uses a lower similarity threshold (0.4) since the narrower context makes even slightly relevant chunks useful. Great for conversations like "I uploaded this contract — what are the payment terms?"

---

## Memory System with Supermemory

**Supermemory** provides long-term conversational memory, separate from the document RAG system.

- All memories are tagged with the user's ID (`containerTags`) to keep them isolated per user.
- The AI is prompted to call `add_memory` at the end of every response to store insights such as:
  - Sales stage (prospect, qualification, proposal, negotiation, closed)
  - Customer pain points
  - Budget information
  - Decision maker names
  - Follow-up dates
  - Objections raised
  - Product interests
- In future conversations, `search_memories` is called first to retrieve relevant past context, giving Elie continuity across sessions.

---

## Firecrawl — Web Scraping & Search

Two tools powered by the [Firecrawl](https://firecrawl.dev) service:

**`firecrawl`** — Scrapes a given URL and returns clean Markdown content (title, description, author, publish date, images). Ideal for LLM consumption.

**`firesearch`** — Performs web searches and aggregates categorized results from web pages, news, Reddit, YouTube, GitHub, arXiv, and Twitter. Results are deduplicated and formatted with titles, descriptions, URLs, and favicons. The frontend renders search results as cards below the AI response.

---

## Frontend Chat Interface

The `ChatSection` component (~833 lines) orchestrates the entire chat UI.

### Key State
- `input` — Current text input
- `activeChatId` — Currently open chat
- `personalizedPrompts` — Custom prompts from user preferences
- `greeting` — Custom greeting message
- `thinkingText` — Cycles through "thinking" synonyms while the AI is working

### Key Refs
- `autoTriggeredRef` — Prevents double-triggering in React Strict Mode
- `justCreatedChatRef` / `justSentMessageRef` — Track navigation states
- `chatInputRef` — Reference to the input component

### `useStreamingChat` Hook
Provides: `messages`, `setMessages`, `sendMessage`, `isLoading`, `streamingContent`, `streamingToolCalls`, `streamingReasoning`, and `startFromExistingLastUserMessage`.

### Message Sending Flow
1. User hits send → `handleSendMessage` runs.
2. If no active chat: creates new chat → saves message to DB → navigates to new chat page.
3. If chat exists: saves message to DB → calls `sendMessage` from the hook.
4. A `useEffect` auto-triggers the AI response when there's exactly one user message with no assistant reply yet (handles fresh chat navigation).

### Rendering
`ChatMessages` renders all messages, combining the messages array with streaming state. For each message it shows: attachments, reasoning/thinking UI, search source cards, tool call details (in dev mode), Markdown-rendered response text, and a copy button.

---

## Database Schema & Relationships

### `user`
Stores accounts: `id`, `email`, `name`, `image`. Auth managed by `better-auth`.

### `chat`
`id`, `userId`, `title`, `createdAt`, `updatedAt`, `attachments` (JSON metadata for attached files/projects).

### `message`
`chatId` (FK), `role` (`user` | `assistant` | `tool`), `content`, `parts` (JSON array of text/tool-call/tool-result parts), `attachments` (JSON), `sequence` (integer ordering), token usage tracking fields.

### `fileUpload`
`userId`, `folderId` (optional), `filename`, `fileType`, `filePath` (S3 path), `integrationName`, `integrationLogo` (base64), `imageBase64`, `extractedText`, `createdAt`, `updatedAt`.

### `documentChunk`
`fileId` (FK), `userId` (FK), `content` (chunk text), `embedding` (`vector(768)` via pgvector), `metadata` (JSON), `createdAt`. Indexed on `userId` and `fileId` for fast pre-filtering before vector search.

### `folder`
`userId`, `name`, timestamps. Organizes files into projects.

### `userPreferences`
`systemPreferences` (JSON with `customSystemPrompt`), `prompts` (JSON array), `metadata` (JSON with usage counts), `generatedAt`, `expiresAt` (cache invalidation). This is the source of the primary context injected into the system prompt.

---

## Full End-to-End Flow

> **Example:** User asks "analyze my OneDrive sales report from last month"

1. User types in `ChatSection`
2. `handleSendMessage` calls `addMessageToChat` → saved to PostgreSQL
3. `sendMessage` from hook → `POST /api/chat`
4. Backend authenticates user, loads chat & message history
5. Creates/retrieves MCP session with Composio
6. Builds system prompt with user's primary context
7. Initializes all tools (MCP, RAG, memory, custom)
8. Calls `streamText` with Gemini model
9. Gemini calls `search_memories` → returns past context about monthly reports
10. Gemini calls `list_composio_tools` with `integration: "onedrive"`
11. Gemini calls `onedrive_search_files` → returns file metadata + ID
12. Gemini calls `smart_file_reader` → returns download instructions
13. Gemini calls `onedrive_download_file` with file ID
14. Composio downloads file via Microsoft Graph API
15. Gemini calls `composio_file_processor` with download response
16. Processor extracts buffer → uploads to MinIO
17. `processFile` extracts text from Excel (XLSX)
18. `chunkText` splits into segments
19. `generateEmbeddings` creates 768-dim vectors for all chunks
20. Chunks + vectors saved to PostgreSQL via pgvector
21. Processor returns success message
22. Gemini calls `local_rag_search` → queries the just-processed file
23. RAG returns relevant chunks as context
24. Gemini formulates response citing specific data from the file
25. Response streams back token by token
26. Frontend accumulates in `streamingContent` state → UI updates in real time
27. Stream finishes → `onFinish` saves complete response to DB
28. Gemini calls `add_memory` to store insights about the report
29. User sees final formatted analysis

**Total time: ~10–15 seconds depending on file size.**

---

## Technical Gotchas & Design Choices

**Save to DB before calling API** — Prevents message loss if the API call fails. Database is always the source of truth.

**Streaming prevents timeout issues** — Keeps the HTTP connection alive during long tool-calling chains that would otherwise hit timeout limits.

**Token usage tracking** — Input/output/total tokens and completion time are tracked per message for analytics and optimization.

**Session caching** — The `sessionCache` map keeps MCP client connections alive per user per chat, avoiding costly reconnection on every request. Sessions live in memory for the lifetime of the Next.js process.

**Duplicate prevention** — `composio_file_processor` checks for duplicate files from the same integration before processing.

**Vector dimension consistency** — All embeddings use 768 dimensions matching `gemini-embedding-001`. The pgvector column is defined as `vector(768)` — mismatched dimensions will fail on insert.

**Error handling philosophy** — Extensive try-catch blocks with graceful degradation: if a tool fails, it returns an error message so the AI can adapt rather than crash.

**Memory after every response** — The prompt explicitly instructs the AI to call `add_memory` at the end of every response, ensuring the memory system stays up to date and progressively learns about each user.

---

## Deployment & Environment

Based on the `docker-compose` configuration, the following services are required:

- **PostgreSQL** with the `pgvector` extension
- **MinIO** for S3-compatible object storage
- **Next.js app** (deployed on Vercel or similar serverless platform)

### Required Environment Variables

```env
GOOGLE_API_KEY=           # Gemini model & embeddings
COMPOSIO_API_KEY=         # Integration tools
SUPERMEMORY_API_KEY=      # Long-term memory system
FIRECRAWL_API_KEY=        # Web scraping & search
DATABASE_URL=             # PostgreSQL connection string
MINIO_ENDPOINT=           # MinIO/S3 endpoint
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
```

---

## What Could Be Improved

- The 50-step tool call limit may prematurely stop complex multi-step workflows
- File deduplication is basic — could be enhanced with content hashing
- Embeddings are not cached, so uploading the same file twice regenerates them
- Session cache is in-memory and lost on process restart — Redis would be more robust
- Tool calls are executed sequentially, not in parallel — slower for multi-tool tasks
- No feedback mechanism to improve RAG retrieval relevance
- Supermemory is an external dependency — a self-hosted solution could reduce costs and latency
- API costs (Gemini, Composio, Supermemory, Firecrawl) can accumulate quickly at scale
- Chat streams are not persisted across page refreshes or broken connections
- File processing should use a proper job queue (e.g., BullMQ) for reliability

---

## Migration Notes (FastAPI)

The FastAPI migration splits the system into a **backend service** and an **AI microservice**.

**File uploads:**
The user uploads a file to the backend. The backend hashes it, checks for duplicates per user, and if new, forwards it to the AI microservice. The AI service handles text extraction, chunking, and embedding generation. Embeddings are then sent back to the backend for persistence — keeping all database logic in one place and maintaining clean separation of concerns.

**Chat input:**
The user sends a message to the backend. The backend stores it, fetches relevant chat history, and forwards the text + context to the AI microservice. The AI service runs the full LLM flow — tool calling, memory lookup, global RAG, local RAG (with higher priority for user-uploaded files), and response generation — and streams the result back through the backend to the frontend.

The AI microservice supports all existing tools: Composio integrations, Supermemory long-term memory, global RAG, local RAG, and user-defined system prompts and business context. Functionally equivalent to the current system — cleanly split across services.
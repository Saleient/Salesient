import { experimental_createMCPClient as createMCPClient } from "@ai-sdk/mcp";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { stepCountIs, streamText, type Tool, tool, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { headers } from "next/headers";
import { z } from "zod";
import { ComposioFileProcessor } from "@/ai/tools/composio-file-processor";
import { Firecrawl } from "@/ai/tools/firecrawl";
import { Firesearch } from "@/ai/tools/firesearch";
import { createLocalRAGTool } from "@/ai/tools/local-rag";
import { createMemoryTools } from "@/ai/tools/memory";
import { RAGTool } from "@/ai/tools/rag";
import { createSmartFileReader } from "@/ai/tools/smart-file-reader";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { getComposio } from "@/lib/compostio";
import {
  addMessageToChat,
  generateTitleFromUserMessage,
  getChatById,
  getMessagesByChatId,
  updateChatTitle,
} from "@/queries/chat";

type ToolsRecord = Record<string, Tool>;

type MCPSessionCache = {
  session: { url: string; sessionId: string };
  client: Awaited<ReturnType<typeof createMCPClient>>;
  tools: ToolsRecord;
};

type ToolCall = {
  toolCallId: string;
  toolName: string;
  args: unknown;
};

type ToolResult = {
  toolCallId: string;
  result: unknown;
};

type MessagePart = {
  type: string;
  text?: string;
  toolInvocation?: {
    toolCallId: string;
    toolName: string;
    args: unknown;
    state: string;
    result?: unknown;
  };
  [key: string]: unknown;
};

type MessageAttachment = {
  id: string;
  type: string;
  name: string;
};

type ResponseMessage = {
  role: string;
  content:
    | string
    | Array<{ type: string; text?: string; [key: string]: unknown }>;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
};

type UsageInfo = {
  promptTokens?: number;
  inputTokens?: number;
  completionTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

type ResponseObject = {
  messages: ResponseMessage[];
};

// Track token usage & completion timing.
// Avoid console in production per project guidelines.
type TokenUsageRecord = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  completionTimeMs: number;
};

function recordTokenUsage(usage: TokenUsageRecord) {
  // If you later want to persist, replace this no-op / dev log with DB or analytics.
  if (process.env.NODE_ENV !== "production") {
    // Using console only in non-production to respect guidelines.
    // eslint-disable-next-line no-console
    console.log(
      `Token usage -> prompt: ${usage.inputTokens}, completion: ${usage.outputTokens}, total: ${usage.totalTokens}, time(ms): ${usage.completionTimeMs}`
    );
  }
}

function createMessageSignature(message: {
  content?: string;
  parts?: unknown[];
}) {
  const normalizedText = (message.content ?? "").trim();
  const normalizedParts =
    Array.isArray(message.parts) && message.parts.length > 0
      ? stableStringify(message.parts)
      : "";

  return `${normalizedText}::${normalizedParts}`;
}

function stableStringify(obj: unknown): string {
  if (obj === undefined) return "";
  if (obj === null) return "null";
  if (typeof obj !== "object") return JSON.stringify(obj);

  if (Array.isArray(obj)) {
    return "[" + obj.map(stableStringify).join(",") + "]";
  }

  // Handle Date objects which are typeof object but should be stringified directly
  if (obj instanceof Date) {
    return JSON.stringify(obj);
  }

  const keys = Object.keys(obj as object).sort();
  const parts: string[] = [];

  for (const key of keys) {
    const val = (obj as Record<string, unknown>)[key];
    if (val !== undefined) {
      parts.push(JSON.stringify(key) + ":" + stableStringify(val));
    }
  }

  return "{" + parts.join(",") + "}";
}

// Session cache to store MCP sessions per chat session per user
const sessionCache = new Map<string, MCPSessionCache>();

function getContentLength(content: unknown): number {
  if (typeof content === "string") {
    return content.length;
  }
  if (Array.isArray(content)) {
    return content.length;
  }
  return 0;
}

type ContentPart = {
  type: string;
  text?: string;
  toolCallId?: string;
  toolName?: string;
  args?: unknown;
  result?: unknown;
};

function processMessageParts(parts: unknown[]): ContentPart[] {
  const contentParts: ContentPart[] = [];

  for (const part of parts) {
    const p = part as MessagePart;
    if (p.type === "text") {
      contentParts.push({ type: "text", text: p.text });
    } else if (p.type === "tool-invocation" && p.toolInvocation) {
      const ti = p.toolInvocation;
      if (ti.state === "result") {
        contentParts.push({
          type: "tool-result",
          toolCallId: ti.toolCallId,
          toolName: ti.toolName,
          result: ti.result,
        });
      } else {
        contentParts.push({
          type: "tool-call",
          toolCallId: ti.toolCallId,
          toolName: ti.toolName,
          args: ti.args,
        });
      }
    }
  }

  return contentParts;
}

function buildAttachmentInfo(attachments: unknown[]): string {
  const typedAttachments = attachments as MessageAttachment[];
  const fileAttachments = typedAttachments.filter((a) => a.type === "file");
  const projectAttachments = typedAttachments.filter(
    (a) => a.type === "project"
  );

  let attachmentInfo = "";
  if (fileAttachments.length > 0) {
    const fileIds = fileAttachments.map((a) => a.id).join(", ");
    const fileNames = fileAttachments.map((a) => a.name).join(", ");
    attachmentInfo += `\n\n[ATTACHED FILES: ${fileIds}]\n[FILE NAMES: ${fileNames}]`;
  }
  if (projectAttachments.length > 0) {
    const projectIds = projectAttachments.map((a) => a.id).join(", ");
    const projectNames = projectAttachments.map((a) => a.name).join(", ");
    attachmentInfo += `\n\n[ATTACHED PROJECTS: ${projectIds}]\n[PROJECT NAMES: ${projectNames}]`;
  }

  return attachmentInfo;
}

function convertMessageToCoreFormat(m: {
  id: string;
  role: "user" | "assistant" | "system" | "data" | "tool";
  content?: string;
  parts?: unknown[];
  attachments?: unknown[];
}) {
  const contentParts: ContentPart[] = [];

  // Process parts array to preserve tool context
  if (m.parts && Array.isArray(m.parts)) {
    contentParts.push(...processMessageParts(m.parts));
  }

  // Fallback to content field if parts is empty
  if (contentParts.length === 0 && m.content) {
    contentParts.push({ type: "text", text: m.content });
  }

  // Add attachment metadata
  if (
    m.attachments &&
    Array.isArray(m.attachments) &&
    m.attachments.length > 0
  ) {
    const attachmentInfo = buildAttachmentInfo(m.attachments);
    if (attachmentInfo) {
      contentParts.push({ type: "text", text: attachmentInfo });
    }
  }

  // If we only have text parts, simplify to string content
  const hasOnlyText =
    contentParts.length > 0 && contentParts.every((p) => p.type === "text");
  if (hasOnlyText) {
    return {
      id: m.id,
      role: m.role,
      content: contentParts.map((p) => p.text).join(""),
      parts: contentParts,
    };
  }

  return {
    id: m.id,
    role: m.role,
    content: contentParts,
    parts: contentParts,
  };
}

async function saveChatMessages(
  chatId: string | null | undefined,
  response: ResponseObject
) {
  console.log("🔄 saveChatMessages called with:", {
    chatId,
    responseMessages: response?.messages?.length || 0,
    hasResponse: !!response,
    hasMessages: !!response?.messages,
  });

  if (chatId && response?.messages) {
    console.log(
      "📝 Processing messages for save:",
      response.messages.map((msg) => ({
        role: msg.role,
        contentType: typeof msg.content,
        contentLength: getContentLength(msg.content),
        hasToolCalls: !!msg.toolCalls,
        toolCallsCount: msg.toolCalls?.length || 0,
        hasToolResults: !!msg.toolResults,
        toolResultsCount: msg.toolResults?.length || 0,
      }))
    );

    try {
      const assistantMessages = response.messages.filter(
        (msg) => msg.role === "assistant"
      );
      const latestAssistant = assistantMessages.at(-1);

      if (!latestAssistant) {
        console.log("⏭️ Skipping save - no assistant message in response");
        return;
      }

      const partsForDb = extractParts(latestAssistant);
      const textContent = extractTextContent(partsForDb);
      const hasText = textContent.trim().length > 0;
      const hasParts = partsForDb.length > 0;

      if (!(hasText || hasParts)) {
        console.log("⏭️ Skipping save - assistant message is empty");
        return;
      }

      const existingMessages = await getMessagesByChatId(chatId);
      const lastSavedAssistant = [...existingMessages]
        .reverse()
        .find((m) => m.role === "assistant");

      const existingSignature = lastSavedAssistant
        ? createMessageSignature({
            content: lastSavedAssistant.content ?? undefined,
            parts: Array.isArray(lastSavedAssistant.parts)
              ? (lastSavedAssistant.parts as unknown[])
              : [],
          })
        : null;

      const candidateSignature = createMessageSignature({
        content: textContent,
        parts: partsForDb,
      });

      if (existingSignature && existingSignature === candidateSignature) {
        return;
      }

      await processAndSaveMessage(chatId, latestAssistant, {
        partsForDb,
        textContent,
      });
    } catch (error) {
      console.error("❌ Error saving chat messages:", error);
    }
  } else {
    console.log("⚠️ Skipping save - missing chatId or messages", {
      chatId: !!chatId,
      hasMessages: !!response?.messages,
    });
  }
}

async function processAndSaveMessage(
  chatId: string,
  msgObj: ResponseMessage,
  options?: { partsForDb?: unknown[]; textContent?: string }
) {
  const role = msgObj.role;

  console.log(`🔎 processAndSaveMessage - role: ${role}`);

  if (role === "system") {
    console.log("⏭️ Skipping system message");
    return;
  }

  const partsForDb = options?.partsForDb ?? extractParts(msgObj);
  const textContent = options?.textContent ?? extractTextContent(partsForDb);

  if (textContent.trim().length === 0 && partsForDb.length === 0) {
    console.log("⏭️ Skipping save - no content or parts to persist");
    return;
  }

  console.log("📊 Message details:", {
    role,
    partsCount: partsForDb.length,
    textContentLength: textContent?.length || 0,
    partsPreview: partsForDb.map((part) => {
      const p = part as MessagePart;
      return {
        type: p?.type || "unknown",
        hasToolInvocation: !!p?.toolInvocation,
        toolName: p?.toolInvocation?.toolName,
        toolState: p?.toolInvocation?.state,
      };
    }),
  });

  const savedMessage = await addMessageToChat({
    chatId,
    role: role as "user" | "assistant" | "tool",
    parts: partsForDb,
    attachments: [],
    content: textContent || undefined,
  });

  console.log("💾 Saved message to DB:", {
    messageId: savedMessage.id,
    savedPartsCount: Array.isArray(savedMessage.parts)
      ? savedMessage.parts.length
      : 0,
    savedRole: savedMessage.role,
    savedContentLength: savedMessage.content?.length || 0,
  });
}

function extractParts(msgObj: ResponseMessage): unknown[] {
  const partsForDb: unknown[] = [];

  console.log("🔧 extractParts called with:", {
    contentType: typeof msgObj.content,
    hasToolCalls: !!msgObj.toolCalls,
    toolCallsCount: msgObj.toolCalls?.length || 0,
    hasToolResults: !!msgObj.toolResults,
    toolResultsCount: msgObj.toolResults?.length || 0,
  });

  // Handle content (text parts)
  if (typeof msgObj.content === "string") {
    partsForDb.push({ type: "text", text: msgObj.content });
    console.log(
      "✏️ Added text content part:",
      msgObj.content.length,
      "characters"
    );
  } else if (Array.isArray(msgObj.content)) {
    partsForDb.push(...msgObj.content);
    console.log(
      "📋 Added content array parts:",
      msgObj.content.length,
      "parts"
    );
  }

  // Add tool invocations
  if (msgObj.toolCalls && Array.isArray(msgObj.toolCalls)) {
    console.log(`🔧 Processing ${msgObj.toolCalls.length} tool calls`);

    for (const tc of msgObj.toolCalls) {
      const result = msgObj.toolResults?.find(
        (tr) => tr.toolCallId === tc.toolCallId
      );

      const toolInvocationPart = {
        type: "tool-invocation",
        toolInvocation: {
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          args: tc.args,
          state: result ? "result" : "call",
          result: result?.result,
        },
      };

      console.log("🔧 Adding tool invocation part:", {
        toolCallId: tc.toolCallId,
        toolName: tc.toolName,
        hasResult: !!result,
        state: result ? "result" : "call",
        argsPreview: JSON.stringify(tc.args).substring(0, 100),
      });

      partsForDb.push(toolInvocationPart);
    }
  }

  console.log(`📦 extractParts returning ${partsForDb.length} parts total`);
  return partsForDb;
}

function extractTextContent(parts: unknown[]): string {
  const textParts = parts.filter((p): p is MessagePart => {
    const part = p as MessagePart;
    return (
      typeof part === "object" &&
      part !== null &&
      "type" in part &&
      part.type === "text" &&
      typeof part.text === "string"
    );
  });
  return textParts.map((p) => p.text || "").join("");
}

const messageSchema = z.object({
  messages: z.array(z.any()).optional(),
  id: z.string().nullable().optional(),
  provider: z.string().nullable().optional(),
  enabledToolkits: z
    .array(
      z.object({
        slug: z.string(),
        isConnected: z.boolean(),
      })
    )
    .optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userEmail = session.user.email;
    if (!userEmail) {
      return new Response("User email not found", { status: 400 });
    }
    const body = await req.json();

    const { messages: incomingMessages, id: chatId } =
      messageSchema.parse(body);

    if (!(incomingMessages && Array.isArray(incomingMessages))) {
      return new Response("Invalid messages format", { status: 400 });
    }

    if (!chatId) {
      return new Response("Chat ID required", { status: 400 });
    }

    const existingChat = await getChatById(chatId);
    if (!existingChat || existingChat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 403 });
    }

    const dbMessages = await getMessagesByChatId(chatId);

    // Use DB messages as source of truth since frontend saves before calling API
    let messages = dbMessages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant" | "system" | "data" | "tool",
      content: m.content || "",
      parts: Array.isArray(m.parts) ? (m.parts as unknown[]) : [],
      attachments: Array.isArray(m.attachments) ? m.attachments : [],
    }));

    // Fallback to incoming messages if DB is empty (shouldn't happen normally)
    if (
      messages.length === 0 &&
      incomingMessages &&
      incomingMessages.length > 0
    ) {
      messages = incomingMessages;
    }

    // Generate title if it's still the default "New Chat"
    if (existingChat.title === "New Chat") {
      const firstUserMessage = messages.find((m) => m.role === "user");
      if (firstUserMessage) {
        generateTitleFromUserMessage({
          message: firstUserMessage as unknown as import("ai").UIMessage,
        })
          .then((title) => updateChatTitle(chatId, title))
          .catch(() => {
            // ignore
          });
      }
    }

    // Create a unique session key based on user and conversation
    const sessionKey = `${session.user.id}-${chatId}`;

    const { tools: mcpTools } = await getOrCreateMCPSession(
      sessionKey,
      userEmail
    );

    const dbUserPrefs = await db.query.userPreferences.findFirst({
      where: (userPreferences, { eq }) =>
        eq(userPreferences.userId, session.user.id),
      columns: {
        systemPreferences: true,
      },
    });

    const systemPrefs = dbUserPrefs?.systemPreferences as
      | { customSystemPrompt?: string }
      | null
      | undefined;
    const customPrompt = systemPrefs?.customSystemPrompt;
    const currentTimeIso = new Date().toISOString();

    // Build system prompt with custom instructions taking priority
    let systemPrompt = `Current time (UTC): ${currentTimeIso}\n\n`;

    // If user has custom instructions, prioritize them at the top
    if (customPrompt && customPrompt.trim().length > 0) {
      systemPrompt += `# PRIMARY CONTEXT - USER'S BUSINESS INFORMATION
This is the most important context. All answers should reference and prioritize this information:

${customPrompt}

---

`;
    }

    // Add base assistant capabilities
    systemPrompt += `You are Elie, a helpful AI sales assistant. You drive sales for [PRODUCT/SERVICE NAME, e.g., "our AI-powered CRM tool"] by qualifying leads, building rapport, demonstrating value, and closing deals. You integrate **ONLY** with CRMs (Salesforce, HubSpot, Pipedrive), HRMS (Workday, BambooHR, ADP), file storage (Google Drive, Dropbox, OneDrive), and email (Gmail, Outlook, Mailchimp) via Composio tools.

**CORE RULES - NEVER BREAK:**
- **ALWAYS check the PRIMARY CONTEXT section above first** - it contains critical business information that should inform all your responses
- When asked about company information, goals, or context, **ALWAYS reference the PRIMARY CONTEXT** section
- NEVER ask for Composio User ID, Entity ID, or connection details.
- NEVER suggest manual file handling—ALWAYS use tools for files.
- End EVERY response with \`add_memory\` to log insights (e.g., sales stage, pain points).
- Output ONLY clean Markdown to users—hide reasoning/tools.
- For sales: Qualify early (fit/pain points), personalize with memories/RAG, end with CTA (e.g., [Demo](url)).

**REASONING PROCESS (Chain-of-Thought - Think Step-by-Step):**
1. **Analyze**: Parse query for sales stage, pains, fit. Check for [ATTACHED FILES: {...}] or cloud file mentions (e.g., "my OneDrive report.pdf"). **Check PRIMARY CONTEXT for relevant business information.**
2. **Context/Tools**: Call \`search_memories\` first. If files attached, call \`LOCAL_RAG_SEARCH\` with exact fileIds/projectIds. For cloud files, trigger FILE WORKFLOW below—plan dynamically. Use \`GLOBAL_RAG_SEARCH\` for product knowledge if needed. If unsure of tools, query available ones (e.g., via Composio inventory).
3. **Execute & Refine**: Call tools in JSON format: { "tool": "TOOL_NAME", "params": { ... } }. For files, reason: "Integration has direct read (e.g., Google Docs)? Use it. Else, route to SMART_FILE_READER for workflow." Retry failed calls once. Incorporate results into sales response.
4. **Respond**: Tie tools to value (e.g., "Based on your file, we can automate 40% of your workflow"). End with CTA.

**🚨 FILE PROCESSING WORKFLOW - MANDATORY FOR ANY FILE MENTION 🚨**
If user mentions/attaches files from cloud storage (OneDrive, Google Drive, Dropbox, Box, S3, SharePoint, Notion) or [ATTACHED FILES: {...}]:
- **Plan Dynamically**: Reason on integration: Does it support direct read/export (e.g., Google Docs via GOOGLEDOCS_GET_DOCUMENT_BY_ID)? If yes, use that. If not (e.g., OneDrive), start with metadata fetch (LIST/SEARCH tools) then route to SMART_FILE_READER for instructions.
- **Core Steps (Adapt as Needed)**:
  - **Metadata**: Use integration-specific tools (e.g., search/list files) to get ID/path—select based on integration.
  - **Route/Process**: Call \`SMART_FILE_READER\` {integration: "onedrive", fileId: "...", fileName: "..."} if no direct read. Follow its returned workflow EXACTLY (e.g., download → process).
  - **Download/Process**: Execute returned actions (e.g., download tools), then \`COMPOSIO_FILE_PROCESSOR\` with response.
  - **Post-Process**: Query via \`LOCAL_RAG_SEARCH\` {query: "relevant excerpt"}. Reference specifics: "From your attached report.pdf: 'Quote here' shows a 20% efficiency gap we can fix."
- **Errors**: If fails, say: "Technical glitch processing—let's try emailing it or I can demo integration." Retry once; suggest alternative tool.

**TOOL CALL EXAMPLES (Output in JSON - Show Planning):**
- Cloud File: User: "Analyze my Google Drive sales-report.xlsx".
  → <thinking>Google Drive supports direct export—check if read tool available; else SMART_FILE_READER.</thinking>
  → { "tool": "GOOGLEDRIVE_FILES_GET", "params": { "fileId": "from_search" } }  // Or SMART_FILE_READER if needed
  → Respond: "Your report shows Q3 leads at 15%—our tool boosts that 30%. [Schedule Demo](url)"
- Attachment: [ATTACHED FILES: file-123]
  → { "tool": "LOCAL_RAG_SEARCH", "params": { "fileIds": ["file-123"], "query": "key sales metrics" } }

**SALES STRATEGY INTEGRATION:**
- **Qualify**: "What's your biggest CRM bottleneck?"
- **Value**: 2-3 points + tool insights (e.g., "Per your HubSpot data via integration...").
- **Objections**: Acknowledge, reframe: "Valid—ROI in 2 months via automation."
- **CTA**: Always nudge: [Start Trial](url) or "Ready for a 15-min call?"

**ALLOWED TOOLS ONLY**: search_memories, GLOBAL_RAG_SEARCH, LOCAL_RAG_SEARCH, SMART_FILE_READER, COMPOSIO_FILE_PROCESSOR, + Composio actions (dynamic selection). Redirect off-topic: "We specialize in CRM/HR—how can I assist there?"`;
    console.log("📝 System Prompt:", systemPrompt);
    const memoryTools = createMemoryTools(session.user.id);
    const listComposioTools = tool({
      description:
        "List available Composio tools for an integration (e.g., 'google_docs') to plan calls. Returns tool names/descriptions.",
      inputSchema: z.object({
        integration: z.string().describe("e.g., 'google_docs', 'onedrive'"),
      }),
      execute: ({ integration }) => {
        // Filter MCP tools by prefix (e.g., 'GOOGLEDOCS_' for google_docs)
        const allTools = Object.keys(mcpTools);
        const filtered = allTools.filter((t) =>
          t.toLowerCase().includes(integration.replace("_", ""))
        );
        return {
          tools: filtered.map((t) => ({
            name: t,
            description: mcpTools[t].description || "N/A",
          })),
          suggestion: `For ${integration}: Prioritize direct read like ${filtered.find((t) => t.includes("GET")) || "SEARCH"}.`,
        };
      },
    });
    const tools = {
      ...mcpTools,
      list_composio_tools: listComposioTools,
      firecrawl: Firecrawl,
      firesearch: Firesearch,
      GLOBAL_RAG_SEARCH: RAGTool,
      LOCAL_RAG_SEARCH: createLocalRAGTool(session.user.id),
      SMART_FILE_READER: createSmartFileReader(session.user.id),
      COMPOSIO_FILE_PROCESSOR: ComposioFileProcessor,
      search_memories: memoryTools.searchMemories,
      add_memory: memoryTools.addMemory,
    };

    // Convert messages to CoreMessage format for streamText
    const filteredMessages = messages.filter(
      (m) => m.role !== "tool" && m.role !== "data"
    );
    const coreMessages = filteredMessages.map((m) =>
      convertMessageToCoreFormat(m)
    );

    const startedAt = Date.now();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: coreMessages as import("ai").CoreMessage[],
      tools,
      stopWhen: stepCountIs(10),
      maxOutputTokens: 4096,
      temperature: 0.5,
      onFinish: async ({ response, usage }) => {
        // Record real token usage from the model
        try {
          const completionTimeMs = Date.now() - startedAt;
          recordTokenUsage({
            inputTokens: usage?.inputTokens ?? 0,
            outputTokens: usage?.outputTokens ?? 0,
            totalTokens: usage?.totalTokens ?? 0,
            completionTimeMs,
          });
        } catch (error) {
          console.error("❌ Error recording token usage:", error);
        }

        // Persist assistant messages to DB
        try {
          await saveChatMessages(chatId, response as unknown as ResponseObject);
        } catch (error) {
          console.error("❌ Error saving messages:", error);
        }
      },
    });

    return result.toUIMessageStreamResponse({
      originalMessages: filteredMessages as unknown as UIMessage[],
    });
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}
async function getOrCreateMCPSession(
  sessionKey: string,
  userEmail: string
): Promise<{
  client: Awaited<ReturnType<typeof createMCPClient>>;
  tools: ToolsRecord;
}> {
  if (sessionCache.has(sessionKey)) {
    const cached = sessionCache.get(sessionKey);
    if (!cached) {
      throw new Error("Session cache not found");
    }
    return { client: cached.client, tools: cached.tools };
  }

  const composio = getComposio();

  // Enable default toolkit set (no empty array) so each integration gets its own auth flow.
  const mcpSession =
    await composio.experimental.toolRouter.createSession(userEmail);
  const url = new URL(mcpSession.url);

  const mcpClient = await createMCPClient({
    transport: new StreamableHTTPClientTransport(url, {
      sessionId: mcpSession.sessionId,
    }),
  });

  const fetchedTools = await mcpClient.tools();
  const mcpTools = {
    ...fetchedTools,
    REQUEST_USER_INPUT: createRequestUserInputTool(),
  };

  sessionCache.set(sessionKey, {
    session: mcpSession,
    client: mcpClient,
    tools: mcpTools,
  });

  return { client: mcpClient, tools: mcpTools };
}

function createRequestUserInputTool() {
  return tool({
    description:
      "Request custom input fields from the user BEFORE starting OAuth flow. Use ONLY when a service requires additional parameters beyond standard OAuth (e.g., Pipedrive subdomain, Salesforce instance URL, custom API endpoint). DO NOT use for services that only need standard OAuth authorization.",
    inputSchema: z.object({
      provider: z
        .string()
        .describe(
          'The name of the service/provider (e.g., "pipedrive", "salesforce")'
        ),
      fields: z
        .array(
          z.object({
            name: z.string().describe('Field name (e.g., "subdomain")'),
            label: z
              .string()
              .describe('User-friendly label (e.g., "Company Subdomain")'),
            type: z
              .string()
              .optional()
              .describe("Input type (text, email, password, etc.)"),
            required: z
              .boolean()
              .optional()
              .describe("Whether this field is required"),
            placeholder: z
              .string()
              .optional()
              .describe("Placeholder text for the input"),
          })
        )
        .describe("List of input fields to request from the user"),
      authConfigId: z
        .string()
        .optional()
        .describe("The auth config ID to use after collecting inputs"),
      logoUrl: z.string().optional().describe("URL to the provider logo/icon"),
    }),
    execute: async ({
      provider,
      fields,
      authConfigId,
      logoUrl,
    }: {
      provider: string;
      fields: Array<{
        name: string;
        label: string;
        type?: string;
        required?: boolean;
        placeholder?: string;
      }>;
      authConfigId?: string;
      logoUrl?: string;
    }) => {
      // Return a special marker that the frontend will detect
      await Promise.resolve();
      return {
        type: "user_input_request",
        provider,
        fields,
        authConfigId,
        logoUrl,
        message: `Requesting user input for ${provider}`,
      };
    },
  });
}

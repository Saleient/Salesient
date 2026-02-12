#!/usr/bin/env tsx
/**
 * Test available AI Microservice endpoints
 * Run with: npx tsx scripts/test-available-endpoints.ts
 */

import fs from "node:fs";
import path from "node:path";
import {
  aiMicroserviceClient,
  consumeChatStream,
} from "../src/lib/ai-microservice";
import type { ChatStreamRequest } from "../src/lib/ai-microservice";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function separator() {
  console.log("\n" + "=".repeat(80) + "\n");
}

async function testHealthCheck() {
  log("🏥 Testing Health Check...", colors.cyan);
  try {
    const result = await aiMicroserviceClient.healthCheck();
    log(
      `✅ Health: ${result.status} (${result.latencyMs}ms latency)`,
      colors.green
    );
    return true;
  } catch (error) {
    log(
      `❌ Failed: ${error instanceof Error ? error.message : String(error)}`,
      colors.red
    );
    return false;
  }
}

async function testChatStream() {
  separator();
  log("💬 Testing Chat Stream...", colors.cyan);
  try {
    const request: ChatStreamRequest = {
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: "user",
          content: "how can i implement better sales strategy for startup",
        },
      ],
      id: `test-${Date.now()}`,
      user_id: "test-user",
    };

    log("   Sending request...", colors.yellow);
    const stream = await aiMicroserviceClient.chatStream(request);

    let response = "";
    let chunks = 0;

    await consumeChatStream(stream, {
      onTextDelta: (text) => {
        response += text;
        chunks++;
        process.stdout.write(colors.blue + text + colors.reset);
      },
      onToolCallStart: (id, name) => {
        log(`\n   🔧 Tool: ${name}`, colors.yellow);
      },
      onDone: () => {
        log(`\n\n✅ Received ${chunks} chunks`, colors.green);
        log(`   Response length: ${response.length} chars`, colors.blue);
      },
    });

    return true;
  } catch (error) {
    log(
      `\n❌ Failed: ${error instanceof Error ? error.message : String(error)}`,
      colors.red
    );
    return false;
  }
}

async function testRAGSearch() {
  separator();
  log("🔍 Testing RAG Search...", colors.cyan);

  try {
    // Create test chunks with mock embeddings
    const chunks = [
      {
        content: "The Eiffel Tower is a famous landmark in Paris, France.",
        embedding: Array.from({ length: 768 }, () => Math.random()),
        metadata: { source: "test1" },
      },
      {
        content: "The Statue of Liberty is located in New York City.",
        embedding: Array.from({ length: 768 }, () => Math.random()),
        metadata: { source: "test2" },
      },
      {
        content:
          "The Great Wall of China is one of the world's most famous structures.",
        embedding: Array.from({ length: 768 }, () => Math.random()),
        metadata: { source: "test3" },
      },
    ];

    log("   Searching with 3 test chunks...", colors.yellow);

    const result = await aiMicroserviceClient.ragSearch({
      query: "Tell me about Paris landmarks",
      chunks,
      top_k: 2,
      min_similarity: 0.0,
    });

    log(`✅ Found ${result.total_results} results`, colors.green);
    for (const [i, res] of result.results.entries()) {
      log(
        `   ${i + 1}. [${res.similarity.toFixed(4)}] ${res.content.substring(0, 50)}...`,
        colors.blue
      );
    }

    if (result.structured_context) {
      log(
        `   Generated context: ${result.structured_context.length} chars`,
        colors.blue
      );
    }

    return true;
  } catch (error) {
    log(
      `❌ Failed: ${error instanceof Error ? error.message : String(error)}`,
      colors.red
    );
    return false;
  }
}

async function testLocalRAGSearch() {
  separator();
  log("🔍 Testing Local RAG Search...", colors.cyan);

  try {
    const chunks = [
      {
        content: "Project documentation for feature X",
        embedding: Array.from({ length: 768 }, () => Math.random()),
        metadata: { project_id: "proj-1", file_id: "file-1" },
      },
      {
        content: "Meeting notes about feature Y",
        embedding: Array.from({ length: 768 }, () => Math.random()),
        metadata: { project_id: "proj-2", file_id: "file-2" },
      },
    ];

    log("   Searching with project/file filters...", colors.yellow);

    const result = await aiMicroserviceClient.localRagSearch({
      query: "documentation",
      chunks,
      project_ids: ["proj-1"],
      top_k: 1,
      min_similarity: 0.0,
    });

    log(`✅ Found ${result.total_results} results`, colors.green);
    for (const res of result.results) {
      log(`   • ${res.content}`, colors.blue);
    }

    return true;
  } catch (error) {
    log(
      `❌ Failed: ${error instanceof Error ? error.message : String(error)}`,
      colors.red
    );
    return false;
  }
}

async function testFileProcessing() {
  separator();
  log("📄 Testing PDF File Processing...", colors.cyan);
  try {
    const pdfPath = path.join(process.cwd(), "salesorbit ml doc.pdf");
    if (!fs.existsSync(pdfPath)) {
      log(`⚠️  PDF file not found at: ${pdfPath}`, colors.yellow);
      log("   Skipping PDF processing test", colors.yellow);
      return true; // Return true to not fail the entire test suite
    }

    log(`   Reading PDF: ${path.basename(pdfPath)}...`, colors.yellow);
    const pdfBuffer = fs.readFileSync(pdfPath);
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    const file = new File([blob], "salesorbit ml doc.pdf", { 
      type: "application/pdf" 
    });
    log(`   Processing PDF (${(pdfBuffer.length / 1024).toFixed(2)} KB)...`, colors.yellow);
    const result = await aiMicroserviceClient.processFile(file);

    log(`✅ Processing successful`, colors.green);
    log(`   Text length: ${result.text_length} chars`, colors.blue);
    log(`   \nChunks Received : \n${result.chunks}`, colors.blue);
    console.log(`   \nChunks Received : \n${result.chunks}`)
    console.log(`   \nEmbeddings Received: \n${result.embeddings}`)
    log(`   \nEmbeddings Received: \n${result.embeddings}`, colors.blue);

    if (result.text.length > 0) {
      log(
        `   Extracted text: "${result.text}..."`,
        colors.blue
      );
      log(`   \nChunks Received : \n${result.chunks}`, colors.blue);
      log(`   \nEmbeddings Received: \n${result.embeddings}`, colors.blue);
    }

    return true;
  } catch (error) {
    log(
      `❌ Failed: ${error instanceof Error ? error.message : String(error)}`,
      colors.red
    );
    return false;
  }
}

async function testBatchFileProcessing() {
  separator();
  log("📄 Testing Batch File Processing...", colors.cyan);

  try {
    const files = [
      new File([new Blob(["File 1 content"])], "file1.txt"),
      new File([new Blob(["File 2 content with more text"])], "file2.txt"),
    ];

    log("   Processing 2 files...", colors.yellow);

    const result = await aiMicroserviceClient.processFiles(files);

    log(`✅ Batch processing successful`, colors.green);
    log(`   Files processed: ${result.total_files}`, colors.blue);
    log(`   Total text length: ${result.total_text_length} chars`, colors.blue);
    log(`   Total chunks: ${result.total_chunks_count}`, colors.blue);

    return true;
  } catch (error) {
    log(
      `❌ Failed: ${error instanceof Error ? error.message : String(error)}`,
      colors.red
    );
    return false;
  }
}



async function main() {
  log("\n🚀 AI Microservice - Available Endpoints Test", colors.cyan);
  log(
    "Testing: " + (process.env.AI_MICROSERVICE_URL ?? "http://localhost:8000"),
    colors.yellow
  );
  separator();

  const results = {
    health: false,
    chat: false,
    rag: false,
    localRag: false,
    fileProcessing: false,
    batchFileProcessing: false,
  };

  results.health = await testHealthCheck();

  if (!results.health) {
    log("\n❌ Health check failed. Microservice not responding.", colors.red);
    process.exit(1);
  }

  results.chat = await testChatStream();
  results.rag = await testRAGSearch();
  results.localRag = await testLocalRAGSearch();
  results.fileProcessing = await testFileProcessing();
  results.batchFileProcessing = await testBatchFileProcessing();

  // Summary
  separator();
  log("📋 Test Results", colors.cyan);

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  for (const [name, result] of Object.entries(results)) {
    const icon = result ? "✅" : "❌";
    const color = result ? colors.green : colors.red;
    log(`${icon} ${name}`, color);
  }

  separator();

  if (passed === total) {
    log(`🎉 All tests passed! (${passed}/${total})`, colors.green);

    log(
      "\n📝 Note: The following endpoints are not yet implemented:",
      colors.yellow
    );
    log("   • /api/v1/embeddings", colors.yellow);
    log("   • /api/v1/file-processing/ocr", colors.yellow);
    log("   • /api/v1/file-processing/column-mappings", colors.yellow);
    log("   • /api/v1/file-processing/row-to-sentence", colors.yellow);
    log("   • /api/v1/generate-text\n", colors.yellow);

    process.exit(0);
  } else {
    log(`⚠️  ${total - passed} test(s) failed`, colors.red);
    process.exit(1);
  }
}

main();

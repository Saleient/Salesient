#!/usr/bin/env tsx
/**
 * Interactive chat test with the AI microservice
 * Run with: npx tsx scripts/test-chat-interactive.ts
 */

import * as readline from "node:readline";
import {
  aiMicroserviceClient,
  consumeChatStream,
} from "../src/lib/ai-microservice";
import type {
  ChatMessage,
  ChatStreamRequest,
} from "../src/lib/ai-microservice";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: ChatMessage[] = [];
const chatId = `test-chat-${Date.now()}`;
const userId = "test-user";

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function sendMessage(userMessage: string) {
  messages.push({
    id: `msg-${Date.now()}`,
    role: "user",
    content: userMessage,
  });

  const request: ChatStreamRequest = {
    messages,
    id: chatId,
    user_id: userId,
  };

  console.log("\n🤖 Assistant: ");

  let assistantMessage = "";
  let toolCallCount = 0;

  try {
    const stream = await aiMicroserviceClient.chatStream(request);

    await consumeChatStream(stream, {
      onTextDelta: (text) => {
        if (text) {
          assistantMessage += text;
          process.stdout.write(text);
        }
      },
      onReasoningDelta: (text) => {
        if (text) {
          console.log(`\n💭 [Reasoning: ${text}]`);
        }
      },
      onToolCallStart: (id, name, args) => {
        toolCallCount++;
        console.log(`\n🔧 [Using tool: ${name}]`);
        if (Object.keys(args).length > 0) {
          console.log(`   Args: ${JSON.stringify(args).substring(0, 100)}...`);
        }
      },
      onToolCallResult: (id, result) => {
        console.log(`✓ [Tool completed]`);
        if (Object.keys(result).length > 0 && result.success !== undefined) {
          console.log(`   Success: ${result.success}`);
        }
      },
      onDone: () => {
        if (!assistantMessage && toolCallCount > 0) {
          console.log(
            "\n⚠️  [Response consisted only of tool calls, no text generated]"
          );
        } else if (!assistantMessage) {
          console.log("\n⚠️  [Empty response received]");
        } else {
          console.log("\n");
        }

        messages.push({
          id: `msg-${Date.now()}`,
          role: "assistant",
          content:
            assistantMessage || "[Tool calls executed, no text response]",
        });
      },
      onError: (error) => {
        console.error("\n❌ Stream error:", error.message);
      },
    });
  } catch (error) {
    console.error(
      "\n❌ Error:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function main() {
  console.log("🤖 AI Microservice Interactive Chat");
  console.log("Type your messages and press Enter. Type 'exit' to quit.\n");

  // Health check
  try {
    const health = await aiMicroserviceClient.healthCheck();
    console.log(
      `✅ Connected to microservice (${health.latencyMs}ms latency)\n`
    );
  } catch (error) {
    console.error("❌ Cannot connect to microservice!");
    console.error("   Make sure it's running on port 8000\n");
    process.exit(1);
  }

  while (true) {
    const userInput = await question("\n👤 You: ");

    if (
      userInput.toLowerCase() === "exit" ||
      userInput.toLowerCase() === "quit"
    ) {
      console.log("\n👋 Goodbye!");
      rl.close();
      process.exit(0);
    }

    if (!userInput.trim()) {
      continue;
    }

    await sendMessage(userInput);
  }
}

main();

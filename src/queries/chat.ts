"use server";
import { type UIMessage } from "ai";
import { asc, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { aiMicroserviceClient } from "@/lib/ai-microservice";
import { db } from "@/db/";
import {
  type Chat,
  chat,
  type Message,
  message,
  type User,
  user,
} from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getUser(email: string): Promise<User[]> {
  try {
    return await db.select().from(user).where(eq(user.email, email)).limit(1);
  } catch (error) {
    console.error("Error fetching user:", error);
    return [];
  }
}
export async function createChat(userId: string): Promise<Chat> {
  try {
    const [newChat] = await db.insert(chat).values({ userId }).returning();
    if (!newChat) {
      throw new Error("Failed to create chat - no return value");
    }
    return newChat;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
}

export async function createNewChat() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const newChat = await createChat(session.user.id);
    return newChat;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
}

export async function getChatsByUserId(userId: string): Promise<Chat[]> {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, userId))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
}

export async function getChatHistory() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const chats = await getChatsByUserId(session.user.id);
    return chats;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
}

export async function getChatById(chatId: string): Promise<Chat | null> {
  try {
    const result = await db
      .select()
      .from(chat)
      .where(eq(chat.id, chatId))
      .limit(1);
    return result[0] ?? null;
  } catch (error) {
    console.error("Error fetching chat by ID:", error);
    return null;
  }
}

export async function getMessagesByChatId(chatId: string): Promise<Message[]> {
  try {
    const messages = await db
      .select()
      .from(message)
      .where(eq(message.chatId, chatId))
      .orderBy(asc(message.sequence), asc(message.createdAt));

    return messages;
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    return [];
  }
}

export async function addMessageToChat({
  chatId,
  role,
  parts,
  attachments = [],
  content,
}: {
  chatId: string;
  role: "user" | "assistant" | "tool";
  parts: unknown[];
  attachments?: unknown[];
  content?: string;
}): Promise<Message> {
  try {
    // Verify the chat exists before adding message
    const existingChat = await getChatById(chatId);
    if (!existingChat) {
      throw new Error(`Chat with ID ${chatId} does not exist`);
    }

    // Get the next sequence number
    const existingMessages = await db
      .select()
      .from(message)
      .where(eq(message.chatId, chatId))
      .orderBy(desc(message.sequence));

    const nextSequence =
      existingMessages.length > 0 ? (existingMessages[0].sequence ?? 0) + 1 : 0;

    const [newMessage] = await db
      .insert(message)
      .values({
        chatId,
        role,
        parts,
        attachments,
        content,
        sequence: nextSequence,
      })
      .returning();

    return newMessage;
  } catch (error) {
    console.error("❌ Error adding message to chat:", error);
    throw error;
  }
}

export async function updateMessagePartsAndUsage(
  messageId: string,
  parts?: unknown[],
  options?: {
    inputTokens?: number | null;
    outputTokens?: number | null;
    totalTokens?: number | null;
    completionTime?: number | null;
  }
): Promise<Message | null> {
  try {
    const updateValues: Record<string, unknown> = {};
    if (parts !== undefined) {
      updateValues.parts = parts;
    }
    if (options?.inputTokens !== undefined) {
      updateValues.inputTokens = options.inputTokens;
    }
    if (options?.outputTokens !== undefined) {
      updateValues.outputTokens = options.outputTokens;
    }
    if (options?.totalTokens !== undefined) {
      updateValues.totalTokens = options.totalTokens;
    }
    if (options?.completionTime !== undefined) {
      updateValues.completionTime = options.completionTime;
    }

    const [updated] = await db
      .update(message)
      .set(updateValues)
      .where(eq(message.id, messageId))
      .returning();

    return updated ?? null;
  } catch (error) {
    console.error("Error updating message:", error);
    return null;
  }
}

export async function deleteChatById(
  chatId: string,
  userId: string
): Promise<boolean> {
  try {
    // Verify the chat belongs to the user before deleting
    const chatToDelete = await getChatById(chatId);
    if (!chatToDelete || chatToDelete.userId !== userId) {
      return false;
    }

    await db.delete(chat).where(eq(chat.id, chatId));
    return true;
  } catch (error) {
    console.error("Error deleting chat:", error);
    return false;
  }
}

export async function deleteChat(chatId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const success = await deleteChatById(chatId, session.user.id);
    return success;
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
}

export async function generateTitleFromUserMessage({
  message: uiMessage,
}: {
  message: UIMessage;
}) {
  const title = await aiMicroserviceClient.generateText({
    prompt: `You are an expert title generator. Generate a short title based on a message.
    
    - Keep it under 80 characters
    - Summarize the user's message creatively and uniquely
    - Output only the title, no quotes or colons
    
    Message: ${JSON.stringify(uiMessage)}`,
    maxTokens: 20,
    temperature: 0.7,
  });

  return title.trim();
}

export async function updateChatTitle(
  chatId: string,
  title: string
): Promise<Chat | null> {
  try {
    const [updated] = await db
      .update(chat)
      .set({ title })
      .where(eq(chat.id, chatId))
      .returning();
    return updated ?? null;
  } catch (error) {
    console.error("Error updating chat title:", error);
    return null;
  }
}

// Type for files attached to chats
export type ChatFile = {
  fileId: string;
  fileName: string;
};

/**
 * Get files attached to a chat. Returns minimal info for display.
 * Currently returns an empty array if no attachments or as a safe default.
 */
export async function getChatFiles(_chatId: string): Promise<ChatFile[]> {
  try {
    await Promise.resolve();
    // TODO: implement actual join between messages/attachments and file table
    // For now, return an empty array to keep the UI stable
    return [];
  } catch (error) {
    console.error("Error fetching chat files:", error);
    return [];
  }
}

// Attachment type used by message attachments UI
export type Attachment = {
  id: string;
  type: string; // 'project' | 'file' | other
  name: string;
};

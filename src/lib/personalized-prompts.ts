import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { chat, fileUpload, folder, userPreferences } from "@/db/schema";

// Default fallback prompts
export const DEFAULT_PROMPTS = [
  {
    title: "Summarize my recent notes",
    prompt: "Can you summarize the key points from my recent documents?",
    category: "documents",
  },
  {
    title: "What did we discuss last time?",
    prompt: "What were the main topics from our previous conversations?",
    category: "memory",
  },
  {
    title: "Help me brainstorm ideas",
    prompt: "I need help brainstorming ideas for a project",
    category: "general",
  },
  {
    title: "Analyze my knowledge base",
    prompt: "What are the main themes across all my saved documents?",
    category: "documents",
  },
];

type UserContext = {
  fileCount: number;
  folderCount: number;
  chatCount: number;
  recentFiles: Array<{ fileName: string; fileType: string }>;
  recentChats: Array<{ title: string }>;
  hasIntegrations: boolean;
};

export async function getUserContext(userId: string): Promise<UserContext> {
  const [fileCountResult, folderCountResult, chatCountResult] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(fileUpload)
        .where(eq(fileUpload.userId, userId)),
      db
        .select({ count: count() })
        .from(folder)
        .where(eq(folder.userId, userId)),
      db.select({ count: count() }).from(chat).where(eq(chat.userId, userId)),
    ]);

  const recentFiles = await db
    .select({
      fileName: fileUpload.fileName,
      fileType: fileUpload.fileType,
    })
    .from(fileUpload)
    .where(eq(fileUpload.userId, userId))
    .orderBy(desc(fileUpload.createdAt))
    .limit(5);

  const recentChats = await db
    .select({
      title: chat.title,
    })
    .from(chat)
    .where(eq(chat.userId, userId))
    .orderBy(desc(chat.updatedAt))
    .limit(5);

  return {
    fileCount: fileCountResult[0]?.count ?? 0,
    folderCount: folderCountResult[0]?.count ?? 0,
    chatCount: chatCountResult[0]?.count ?? 0,
    recentFiles,
    recentChats,
    hasIntegrations: false, // TODO: Check for integrations when implemented
  };
}

export async function generatePersonalizedPrompts(userId: string) {
  const context = await getUserContext(userId);
  const prompts = [];

  // Generate prompts based on user's context
  if (context.fileCount > 0) {
    if (context.recentFiles.length > 0) {
      const latestFile = context.recentFiles[0];
      prompts.push({
        title: `Analyze ${latestFile.fileName}`,
        prompt: `Can you help me analyze and extract key insights from ${latestFile.fileName}?`,
        category: "documents",
      });
    }

    prompts.push({
      title: "Search across my documents",
      prompt: `I have ${context.fileCount} documents. Help me find information about...`,
      category: "documents",
    });

    if (context.fileCount > 5) {
      prompts.push({
        title: "Organize my knowledge base",
        prompt: "Can you help me organize and categorize my documents?",
        category: "documents",
      });
    }
  }

  if (context.chatCount > 0) {
    prompts.push({
      title: "Continue our previous conversation",
      prompt: "Let's continue where we left off in our last chat",
      category: "memory",
    });

    if (context.recentChats.length > 0) {
      const recentChat = context.recentChats[0];
      if (recentChat.title !== "New Chat") {
        prompts.push({
          title: `Follow up on: ${recentChat.title}`,
          prompt: `I'd like to follow up on our discussion about ${recentChat.title}`,
          category: "memory",
        });
      }
    }
  }

  if (context.folderCount > 0) {
    prompts.push({
      title: "Compare documents in folders",
      prompt: "Can you compare and contrast documents across my folders?",
      category: "documents",
    });
  }

  // Always add some general prompts
  prompts.push({
    title: "Start a new research topic",
    prompt: "I want to research a new topic and save my findings",
    category: "general",
  });

  // If we don't have enough personalized prompts, add defaults
  let promptIndex = 0;
  while (prompts.length < 4 && promptIndex < DEFAULT_PROMPTS.length * 2) {
    const defaultPrompt = DEFAULT_PROMPTS[promptIndex % DEFAULT_PROMPTS.length];
    if (!prompts.some((p) => p.title === defaultPrompt.title)) {
      prompts.push(defaultPrompt);
    }
    promptIndex++;
  }

  // Limit to 6 prompts
  return prompts.slice(0, 6);
}

export async function updatePersonalizedPrompts(userId: string) {
  try {
    const prompts = await generatePersonalizedPrompts(userId);
    const context = await getUserContext(userId);

    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Check if user already has preferences
    const existing = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(userPreferences)
        .set({
          prompts,
          generatedAt: new Date(),
          expiresAt,
          metadata: {
            fileCount: context.fileCount,
            folderCount: context.folderCount,
            chatCount: context.chatCount,
            hasIntegrations: context.hasIntegrations,
          },
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, userId));
    } else {
      // Insert new
      await db.insert(userPreferences).values({
        userId,
        prompts,
        generatedAt: new Date(),
        expiresAt,
        metadata: {
          fileCount: context.fileCount,
          folderCount: context.folderCount,
          chatCount: context.chatCount,
          hasIntegrations: context.hasIntegrations,
        },
      });
    }

    return { success: true, prompts };
  } catch (error) {
    console.error("Error updating personalized prompts:", error);
    return { success: false, error };
  }
}

export async function getPersonalizedPrompts(userId: string) {
  try {
    const result = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (result.length === 0) {
      // Generate new prompts if none exist
      await updatePersonalizedPrompts(userId);
      return await getPersonalizedPrompts(userId);
    }

    const userPrompts = result[0];

    // Check if prompts are expired
    if (new Date() > new Date(userPrompts.expiresAt)) {
      // Regenerate if expired
      await updatePersonalizedPrompts(userId);
      return await getPersonalizedPrompts(userId);
    }

    return userPrompts.prompts;
  } catch (error) {
    console.error("Error getting personalized prompts:", error);
    // Return default prompts on error
    return DEFAULT_PROMPTS;
  }
}

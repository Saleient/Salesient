import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  addMessageToChat,
  createChat,
  generateTitleFromUserMessage,
  updateChatTitle,
} from "@/queries/chat";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { query } = body as { query?: string };

    // Create new chat
    const newChat = await createChat(session.user.id);

    // If query provided, add it as initial message
    if (query?.trim()) {
      // Add user message
      await addMessageToChat({
        chatId: newChat.id,
        role: "user",
        parts: [{ type: "text", text: query }],
        content: query,
      });

      // Generate title from the query
      try {
        const title = await generateTitleFromUserMessage({
          message: {
            role: "user",
            content: query,
            id: "",
          } as any,
        });
        await updateChatTitle(newChat.id, title);
      } catch {
        // Title generation failed, keep default
      }
    }

    return NextResponse.json({
      success: true,
      chatId: newChat.id,
      message: "Chat created successfully",
    });
  } catch (error) {
    console.error("Error creating new chat:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create chat",
      },
      { status: 500 }
    );
  }
}

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { chat, message } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all chats for the user
    const userChats = await db
      .select()
      .from(chat)
      .where(eq(chat.userId, session.user.id));

    // Get all messages for these chats
    const chatIds = userChats.map((c) => c.id);
    type ExportedMessage = {
      chatTitle: string;
      chatId: string;
      messageId: string;
      role: string;
      content: string;
      createdAt?: Date | null;
      sequence: number;
    };

    const allMessages: ExportedMessage[] = [];

    for (const currentChatId of chatIds) {
      const chatMessages = await db
        .select()
        .from(message)
        .where(eq(message.chatId, currentChatId));

      const chatInfo = userChats.find((c) => c.id === currentChatId);

      chatMessages.forEach((msg) => {
        allMessages.push({
          chatTitle: chatInfo?.title || "Untitled Chat",
          chatId: chatInfo?.id ?? currentChatId,
          messageId: msg.id,
          role: msg.role,
          content: msg.content || "",
          createdAt: msg.createdAt,
          sequence: msg.sequence,
        });
      });
    }

    // Sort messages by chat and sequence
    allMessages.sort((a, b) => {
      if (a.chatId !== b.chatId) {
        return a.chatId.localeCompare(b.chatId);
      }
      return a.sequence - b.sequence;
    });

    // Convert to CSV format
    const csvHeader =
      "Chat Title,Chat ID,Message ID,Role,Content,Created At,Sequence\n";
    const csvRows = allMessages.map((msg) => {
      const escapedContent = `"${(msg.content || "").replace(/"/g, '""')}"`;
      return [
        `"${msg.chatTitle}"`,
        msg.chatId,
        msg.messageId,
        msg.role,
        escapedContent,
        msg.createdAt?.toISOString(),
        msg.sequence,
      ].join(",");
    });

    const csvContent = csvHeader + csvRows.join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="chat-history-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Export chats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

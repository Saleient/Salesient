import type { UIMessage } from "ai";
import { notFound } from "next/navigation";
import ChatSection from "@/components/sections/product/chat/ChatSection";
import { getMessagesByChatId } from "@/queries/chat";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ChatPage({ params }: PageProps) {
  const { id } = await params;

  const messages = await getMessagesByChatId(id);

  if (!messages) {
    notFound();
  }

  // Map DB messages to UIMessage[] expected by the UI (id, role, parts, attachments)
  const initialMessages: UIMessage[] = messages.map((m) => ({
    id: m.id,
    role: m.role as UIMessage["role"],
    parts: Array.isArray(m.parts) ? (m.parts as UIMessage["parts"]) : [],
    attachments: Array.isArray(m.attachments) ? m.attachments : [],
  }));

  return <ChatSection chatId={id} initialMessages={initialMessages} />;
}

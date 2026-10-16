"use client";

import { LayoutGrid, MessageSquare, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Chat } from "@/db/schema";
import { useSession } from "@/lib/auth-client";
import { deleteChat, getChatHistory } from "@/queries/chat";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      getChatHistory()
        .then(setChats)
        .catch(console.error)
        .finally(() => setIsLoadingChats(false));

      // Call again after 10 seconds to ensure we have the latest chat history
      const timeoutId = setTimeout(() => {
        getChatHistory().then(setChats).catch(console.error);
        // Call once more after another 10 seconds
        timeoutId2 = setTimeout(() => {
          getChatHistory().then(setChats).catch(console.error);
        }, 10000);
      }, 10000);
      let timeoutId2: NodeJS.Timeout;

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(timeoutId2);
      };
    }
  }, [session?.user?.id]);

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteChat(chatId);
    setChats((prev) => prev.filter((c) => c.id !== chatId));
  };

  return (
    <Sidebar variant="inset" {...props}>
      {/* Logo / Brand */}
      <SidebarHeader className="h-16 border-b border-sidebar-border/60 px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="font-semibold text-base hover:bg-transparent active:bg-transparent"
              size="lg"
            >
              <a href="/dashboard" className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-sidebar-border bg-black">
                  {/** biome-ignore lint/performance/noImgElement: brand mark */}
                  {/** biome-ignore lint/correctness/useImageSize: CSS sized */}
                  <img
                    alt="Salesient Logo"
                    src="/salesient-mark.png"
                    className="h-full w-full object-contain p-0.5"
                  />
                </span>
                {/** biome-ignore lint/performance/noImgElement: brand wordmark */}
                {/** biome-ignore lint/correctness/useImageSize: CSS sized */}
                <img
                  alt="SALESIENT"
                  src="/salesient-wordmark.png"
                  className="h-3 w-auto object-contain tracking-wider opacity-95"
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <div className="flex flex-col gap-2 p-4 pt-6">
          <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            <span>Workspace</span>
          </div>
          <NavMain />
        </div>

        {/* Chat History */}
        <div className="flex flex-1 flex-col gap-2 p-4 pt-2">
          <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            <span>Recent Threads</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-1">
              {isLoadingChats ? (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Loading...
                </div>
              ) : chats.length === 0 ? (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  No chats yet
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    className="group relative flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    key={chat.id}
                    onClick={() => router.push(`/dashboard/chat/${chat.id}`)}
                    onMouseEnter={() => setHoveredChatId(chat.id)}
                    onMouseLeave={() => setHoveredChatId(null)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden ">
                      <span
                        className="truncate font-medium pl-2 "
                        title={chat.title || "Untitled"}
                      >
                        {chat.title || "New Chat"}
                      </span>
                    </div>

                    {/* Delete Action - appears on hover */}
                    <button
                      className={`rounded-sm p-0.5 text-muted-foreground transition-opacity hover:bg-background hover:text-destructive ${
                        hoveredChatId === chat.id ? "opacity-100" : "opacity-0"
                      }`}
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </SidebarContent>

      {/* User Footer */}
      <SidebarFooter className="border-border/50 border-t px-4 py-4">
        {session?.user && (
          <NavUser
            user={{
              name: session.user.name ?? "User",
              email: session.user.email ?? "",
              avatar: session.user.image ?? "",
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

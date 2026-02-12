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
      <SidebarHeader className="h-16  px-2 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="font-semibold text-lg hover:bg-transparent active:bg-transparent"
              size="lg"
            >
              <a href="/dashboard">
                <span>SalesOrbit</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <div className="flex flex-col gap-2 p-4 pt-10">
          <div className="flex items-center gap-2  text-xs font-medium text-muted-foreground/70">
            <span>Platform</span>
          </div>
          <NavMain />
        </div>

        {/* Chat History */}
        <div className="flex flex-1 flex-col gap-2 p-4 pt-0">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/70">
            <span>Recent Chats</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-1">
              {isLoadingChats ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : chats.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No chats yet
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    className="group relative bg-linear-to-r from-transparent to-sidebar flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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

"use client";

import type { LucideIcon } from "lucide-react";
import { BookOpen, MessageSquare, Plug } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

const items: NavItem[] = [
  { title: "Chat", url: "/dashboard", icon: MessageSquare },
  { title: "Documents", url: "/dashboard/documents", icon: BookOpen },
  { title: "Integrations (beta)", url: "/dashboard/integrations", icon: Plug },
];

export function NavMain() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.url;

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              className="w-full bg-linear-to-r from-transparent to-sidebar justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent"
              isActive={isActive}
            >
              <a href={item.url}>
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

"use client";
import { ChevronsUpDown, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/auth-client";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <div className="relative size-8 overflow-hidden rounded-full">
                {user.avatar ? (
                  <Image
                    alt={user.name}
                    className="object-cover"
                    fill
                    src={user.avatar}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-teal-700 font-semibold text-sm text-white">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="relative size-8 overflow-hidden rounded-full">
                  {user.avatar ? (
                    <Image
                      alt={user.name}
                      className="object-cover"
                      fill
                      src={user.avatar}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-teal-700 font-semibold text-sm text-white">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                className="flex cursor-pointer items-center gap-2"
                href="/settings"
              >
                <Settings className="size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="font-semibold text-xs">
              Theme
            </DropdownMenuLabel>
            <div className="px-2 py-2">
              <ThemeSwitcher className="w-full" />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await signOut();
                  window.location.href = "/login";
                } catch (err) {
                  console.error("Error during logout:", err);
                  window.location.href = "/login";
                }
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

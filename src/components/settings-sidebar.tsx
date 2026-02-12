import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

const settingsMenu = [
  { label: "Profile", href: "/settings/profile" },
  { label: "Account", href: "/settings/account" },
  { label: "Notifications", href: "/settings/notifications" },
  { label: "Integrations", href: "/settings/integrations" },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="font-semibold text-lg">Settings</h2>
      </SidebarHeader>
      <SidebarContent>
        <nav className="space-y-2">
          {settingsMenu.map((item) => (
            <a
              className="block rounded-md px-4 py-2 text-sm hover:bg-gray-100"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}


"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Tv, MessageSquare, Users, Film, Palette, Footprints, Video, Settings2, BookOpen, ImagePlus } from "lucide-react";
import { useAdminConfig } from "@/contexts/AdminConfigContext";

const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-5 h-5", className)}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const { t } = useAdminConfig();

  const adminNavItems = [
    { href: "/admin/dashboard", label: t('adminDashboardTitle'), icon: LayoutDashboard },
    { href: "/admin/general-settings", label: t('adminGeneralSettingsTitle'), icon: Settings2 },
    { href: "/admin/stream-config", label: t('adminLiveConfigTitle'), icon: Tv },
    { href: "/admin/video-call", label: t('adminVideoCallTitle'), icon: Video },
    { href: "/admin/chat-config", label: t('adminChatConfigTitle'), icon: MessageSquare },
    { href: "/admin/whatsapp-config", label: "Config. WhatsApp", icon: WhatsAppIcon },
    { href: "/admin/hero-config", label: t('adminHeroConfigTitle'), icon: Palette },
    { href: "/admin/footer-config", label: t('adminFooterConfigTitle'), icon: Footprints },
    { href: "/admin/courses", label: "Gestionar Cursos", icon: BookOpen },
    { href: "/admin/popups", label: "Popups", icon: ImagePlus },
    { href: "/admin/user-stories", label: t('adminUserStoriesTitle'), icon: Film },
    { href: "/admin/users", label: t('adminManageUsersTitle'), icon: Users },
  ];

  return (
    <aside 
      className={cn(
        "fixed top-0 left-0 z-40 w-64 h-screen pt-16 transition-transform bg-sidebar border-r border-sidebar-border md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )} 
      aria-label="Sidebar"
      onClick={(e) => e.stopPropagation()} // Prevent clicks inside sidebar from closing it
    >
      <ScrollArea className="h-full px-3 pb-4 overflow-y-auto bg-sidebar">
        <div className="pt-4">
          <ul className="space-y-2 font-medium">
            {adminNavItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} passHref>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                       pathname === item.href && "bg-sidebar-primary text-sidebar-primary-foreground"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </ScrollArea>
    </aside>
  );
}

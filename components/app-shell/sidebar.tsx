"use client";

import { BookOpen, Files, FolderTree, LayoutDashboard, Network, Upload } from "lucide-react";
import { usePathname } from "next/navigation";

import { NavItem, type AdminNavItem } from "@/components/app-shell/nav-item";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS: AdminNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/concepts", label: "Concepts", icon: BookOpen, exact: true },
  { href: "/knowledge-areas", label: "Knowledge Areas", icon: FolderTree, exact: true },
  { href: "/concept-graph", label: "Concept Graph", icon: Network, exact: true },
  { href: "/sources", label: "Sources", icon: Files, exact: true },
  { href: "/imports/openalex", label: "Imports", icon: Upload, exact: true, badge: "OpenAlex" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <div className="md:hidden">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.href} item={item} active={isActive(pathname, item)} compact />
            ))}
          </div>
        </ScrollArea>
      </div>

      <aside className="hidden w-72 shrink-0 md:block">
        <div className="sticky top-24 overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center justify-between px-4 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Textbooked
              </p>
              <p className="text-sm font-semibold">Admin Workspace</p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Skeleton
            </Badge>
          </div>
          <Separator />
          <ScrollArea className="h-[calc(100vh-10rem)]">
            <nav className="space-y-1 p-3">
              {NAV_ITEMS.map((item) => (
                <NavItem key={item.href} item={item} active={isActive(pathname, item)} />
              ))}
            </nav>
          </ScrollArea>
        </div>
      </aside>
    </>
  );
}

function isActive(pathname: string, item: AdminNavItem): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

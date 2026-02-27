"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
};

type NavItemProps = {
  item: AdminNavItem;
  active: boolean;
  compact?: boolean;
};

export function NavItem({ item, active, compact = false }: NavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors",
        "border-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground",
        active && "border-border bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        compact && "shrink-0 whitespace-nowrap",
      )}
    >
      <Icon className="size-4" />
      <span className="font-medium">{item.label}</span>
      {item.badge ? (
        <Badge
          variant={active ? "secondary" : "outline"}
          className={cn("ml-auto text-[10px]", compact && "hidden")}
        >
          {item.badge}
        </Badge>
      ) : null}
    </Link>
  );
}

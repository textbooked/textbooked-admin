"use client";

import { ChevronsUpDown, LogOut, Shield } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const title = getTitleFromPath(pathname);
  const email = session?.user?.email ?? "admin";
  const name = session?.user?.name ?? email;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Textbooked Admin
          </p>
          <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 gap-2 rounded-xl px-2">
                <Avatar className="size-7 border">
                  <AvatarImage src={session?.user?.image ?? undefined} alt={name} />
                  <AvatarFallback>{getInitials(name)}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[14rem] truncate text-left text-sm md:inline">
                  {name}
                </span>
                <ChevronsUpDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Shield className="size-4" />
                Admin Session
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs text-muted-foreground">{email}</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="mr-2 size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function getTitleFromPath(pathname: string): string {
  switch (pathname) {
    case "/dashboard":
      return "Dashboard";
    case "/concepts":
      return "Concepts";
    case "/knowledge-areas":
      return "Knowledge Areas";
    case "/concept-graph":
      return "Concept Graph";
    case "/sources":
      return "Sources";
    case "/imports/openalex":
      return "OpenAlex Imports";
    default:
      return "Admin";
  }
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

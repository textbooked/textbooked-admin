"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button type="button" variant="outline" className="h-10 rounded-xl px-3" disabled>
        <span className="hidden text-sm md:inline">Theme</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 rounded-xl px-3"
      onClick={() => setTheme(nextTheme)}
      aria-label="Toggle light or dark mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Moon className="size-4 dark:hidden" />
      <Sun className="hidden size-4 dark:block" />
      <span className="hidden text-sm md:inline">Theme</span>
    </Button>
  );
}

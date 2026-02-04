"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync theme to a cookie so server components can read the applied theme
  useEffect(() => {
    if (!isMounted) return;
    const value = resolvedTheme || "light";
    try {
      // Set cookie without Secure so it works in local dev (adjust flags as needed for production)
      const maxAge = 60 * 60 * 24 * 365; // 1 year
      document.cookie = `app-theme=${value}; path=/; max-age=${maxAge}; samesite=Lax`;
    } catch (e) {
      // ignore in environments where document is unavailable
      // eslint-disable-next-line no-console
      console.warn("Could not write theme cookie", e);
    }
  }, [resolvedTheme, isMounted]);

  if (!isMounted) {
    return (
      <Button
        variant="ghost"
        className="relative h-12 w-12 rounded-full hover:bg-accent"
        disabled
      >
        <Sun className="size-7" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-12 w-12 rounded-full hover:bg-accent"
        >
          {resolvedTheme === "dark" ? (
            <Moon className="size-7" />
          ) : (
            <Sun className="size-7" />
          )}
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={theme === "light" ? "bg-accent" : ""}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={theme === "dark" ? "bg-accent" : ""}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Oscuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={theme === "system" ? "bg-accent" : ""}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>Sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

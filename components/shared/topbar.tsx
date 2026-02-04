"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/sidebar-context";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import { Logo2 } from "./logo2";

export function Topbar() {
  const { isOpen, toggleSidebar } = useSidebar();
  const { theme, resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="h-20 bg-card border-b border-border shadow-sm flex items-center px-6 relative z-30">
      <div className="flex items-center space-x-4 lg:w-64 lg:justify-around">
        {/* Logo dinámico */}
        <div className="flex items-center">
          <Logo2 width={160} height={40} className="h-13 w-auto object-contain" />
        </div>

        {/* Toggle sidebar button */}
        <Button
          variant="ghost"
          onClick={toggleSidebar}
          className="h-10 w-10 rounded-full hover:bg-accent"
        >
          {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </Button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center space-x-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button
          variant="ghost"
          className="relative h-12 w-12 rounded-full hover:bg-accent"
        >
          <Bell className="size-7" />
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
            3
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-12 w-12 rounded-full hover:bg-accent"
            >
              {/* <Avatar className="h-12 w-12">
                <AvatarImage src="/avatars/01.png" alt="@usuario" />
                <AvatarFallback className="text-lg font-semibold">
                  JD
                </AvatarFallback>
              </Avatar> */}
              <User className="size-7" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">John Doe</p>
                <p className="text-xs leading-none text-muted-foreground">
                  john.doe@company.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

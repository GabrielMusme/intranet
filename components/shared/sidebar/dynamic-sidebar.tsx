"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/sidebar-context";
import { SidebarHeader } from "./sidebar-header";
import { SidebarMenu } from "./sidebar-menu";
import { DoorOpen } from "lucide-react";
import Link from "next/link";

interface DynamicSidebarProps {
  className?: string;
}

export function DynamicSidebar({ className }: DynamicSidebarProps) {
  const { isOpen, isMobile, closeSidebar, menuConfig } = useSidebar();

  if (!menuConfig) return null;

  const baseClasses = cn(
    "flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all duration-200 group",
    "hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50",
  );

  return (
    <>
      {/* Overlay para mobile/tablet */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-card border border-border rounded-[8px] shadow-md transition-all duration-300 z-50",
          // Desktop styles (1024px+)
          "lg:relative lg:transform-none",
          isOpen ? "lg:w-64 lg:my-2 lg:ml-2" : "lg:hidden",
          // Mobile/Tablet styles (< 1024px)
          "fixed inset-y-0 left-0 w-64 lg:w-auto",
          isMobile && (isOpen ? "translate-x-0" : "-translate-x-full"),
          className,
        )}
      >
        <div className="flex flex-col h-full">
          <SidebarHeader
            title={menuConfig.title}
            description={menuConfig.description}
            icon={menuConfig.icon}
            image={menuConfig.image}
          />

          <div className="flex-1 overflow-y-auto">
            <SidebarMenu items={menuConfig.items} />
          </div>

          {/* Footer opcional del sidebar */}
          <div className="border-t border-border">

          <nav className="px-4 py-4 space-y-1">
            <Link
              href="/"
              className={baseClasses}
              >
              <div className="flex items-center space-x-3">
                <DoorOpen className="w-5 h-5 flex-shrink-10 transition-colors text-muted-foreground group-hover:text-accent-foreground" />
                <span className="text-sm font-medium truncate transition-colors text-card-foreground group-hover:text-accent-foreground">
                  Salir
                </span>
              </div>
            </Link>
          </nav>
              </div>
        </div>
      </aside>
    </>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuItem } from "@/contexts/sidebar-context";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/contexts/sidebar-context";

interface SidebarMenuProps {
  items: MenuItem[];
  level?: number;
}

interface SidebarMenuItemProps {
  item: MenuItem;
  level: number;
  isActive: boolean;
  hasActiveChild: boolean;
}

function SidebarMenuItem({
  item,
  level,
  isActive,
  hasActiveChild,
}: SidebarMenuItemProps) {
  const [isExpanded, setIsExpanded] = useState(hasActiveChild);
  const { isMobile, closeSidebar } = useSidebar();
  const hasChildren = item.children && item.children.length > 0;
  const pathname = usePathname();

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleLinkClick = () => {
    // Cerrar sidebar en mobile cuando se hace click en un link
    if (isMobile && item.href) {
      closeSidebar();
    }
  };

  const baseClasses = cn(
    "flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all duration-200 group",
    "hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50",
    level > 0 && "ml-4 border-l-2 border-border pl-4",
    isActive && "bg-accent text-accent-foreground",
    hasActiveChild && !isActive && "bg-muted text-muted-foreground"
  );

  const iconClasses = cn(
    "w-5 h-5 flex-shrink-0 transition-colors",
    isActive
      ? "text-accent-foreground"
      : "text-muted-foreground group-hover:text-accent-foreground"
  );

  const content = (
    <>
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {item.icon && <item.icon className={iconClasses} />}
        <span
          className={cn(
            "text-sm font-medium truncate transition-colors",
            isActive
              ? "text-accent-foreground"
              : "text-card-foreground group-hover:text-accent-foreground"
          )}
        >
          {item.title}
        </span>
        {item.badge && (
          <Badge
            variant={isActive ? "default" : "secondary"}
            className="ml-auto"
          >
            {item.badge}
          </Badge>
        )}
      </div>

      {hasChildren && (
        <div
          className={cn(
            "w-5 h-5 flex-shrink-0 transition-transform",
            isExpanded && "rotate-90"
          )}
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </>
  );

  return (
    <div>
      {item.href && !hasChildren ? (
        <Link
          href={item.href}
          className={baseClasses}
          onClick={handleLinkClick}
        >
          {content}
        </Link>
      ) : (
        <button onClick={handleToggle} className={baseClasses}>
          {content}
        </button>
      )}

      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          <SidebarMenu items={item.children!} level={level + 1} />
        </div>
      )}
    </div>
  );
}

export function SidebarMenu({ items, level = 0 }: SidebarMenuProps) {
  const pathname = usePathname();

  // Función para verificar si un item tiene un hijo activo
  const hasActiveChild = (item: MenuItem): boolean => {
    if (item.children) {
      return item.children.some(
        (child) => child.href === pathname || hasActiveChild(child)
      );
    }
    return false;
  };

  return (
    <nav className="px-4 py-4 space-y-1">
      {items.map((item) => {
        const isActive = item.href === pathname;
        const hasActiveChildItem = hasActiveChild(item);

        return (
          <SidebarMenuItem
            key={item.id}
            item={item}
            level={level}
            isActive={isActive}
            hasActiveChild={hasActiveChildItem}
          />
        );
      })}
    </nav>
  );
}

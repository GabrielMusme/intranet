import React from "react";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  image?: string;
  className?: string;
}

export function SidebarHeader({
  title,
  description,
  icon: Icon,
  image,
  className,
}: SidebarHeaderProps) {
  return (
    <div className={cn("px-4 py-6 border-b border-border", className)}>
      <div className="flex items-center space-x-3">
        {image && (
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {Icon && !image && (
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-card-foreground truncate">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground truncate">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

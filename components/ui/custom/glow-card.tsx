"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface GlowCardProps {
  icon?: React.ReactNode;
  image?: string;
  size?: number;
  label?: string;
  glowColorLight?: string;
  glowColorDark?: string;
  enableParallax?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
}

export function GlowCard({
  icon,
  image,
  size = 128,
  label,
  glowColorLight,
  glowColorDark,
  enableParallax = false,
  href,
  onClick,
  className,
  iconClassName,
}: GlowCardProps) {
  const { theme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const defaultLightColor = "rgba(0, 123, 255, 0.15)";
  const defaultDarkColor = "rgba(250, 250, 235, 0.3)";

  const lightColor = glowColorLight || defaultLightColor;
  const darkColor = glowColorDark || defaultDarkColor;

  const glowShadow = isMounted
    ? theme === "light"
      ? `0 0 16px ${lightColor}, 0 0 48px ${lightColor}, 0 0 96px ${lightColor}`
      : `0 0 24px ${darkColor}, 0 0 64px ${darkColor}, 0 0 128px ${darkColor}`
    : `0 0 16px ${lightColor}, 0 0 48px ${lightColor}, 0 0 96px ${lightColor}`;

  const glowShadowHover = isMounted
    ? theme === "light"
      ? `0 0 32px ${lightColor}, 0 0 80px ${lightColor}, 0 0 160px ${lightColor}, 0 0 240px ${lightColor}`
      : `0 0 40px ${darkColor}, 0 0 96px ${darkColor}, 0 0 192px ${darkColor}, 0 0 288px ${darkColor}`
    : `0 0 32px ${lightColor}, 0 0 80px ${lightColor}, 0 0 160px ${lightColor}, 0 0 240px ${lightColor}`;

  const iconSize = size * 0.5;
  const imageSize = size * 0.75;
  const borderRadius = size * 0.15;
  const depthOffset = size * 0.015625;
  const lightLineHeight = size * 0.015625;
  const fontSize = size * 0.125;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableParallax) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    if (!enableParallax) return;
    setMousePosition({ x: 0, y: 0 });
  };

  const containerParallaxTransform = enableParallax
    ? `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px) rotateY(${mousePosition.x * 8}deg) rotateX(${-mousePosition.y * 8}deg)`
    : "translate(0, 0) rotateY(0deg) rotateX(0deg)";

  const iconParallaxTransform = enableParallax
    ? `translate(${mousePosition.x * 5}px, ${mousePosition.y * 5}px)`
    : "translate(0, 0)";

  const labelParallaxTransform = enableParallax
    ? `translate(${mousePosition.x * 8}px, ${mousePosition.y * 8}px) rotateY(${mousePosition.x * 5}deg) rotateX(${-mousePosition.y * 5}deg)`
    : "translate(0, 0) rotateY(0deg) rotateX(0deg)";

  const content = (
    <div
      className={cn(
        "relative group flex flex-col items-center",
        href && "cursor-pointer",
        onClick && "cursor-pointer",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ perspective: enableParallax ? "1200px" : "none" }}
      suppressHydrationWarning
    >
      <div
        className="relative flex items-center justify-center"
        style={{
          transform: containerParallaxTransform,
          transition: enableParallax ? "transform 0.15s ease-out" : "none",
          transformStyle: "flat",
        }}
      >
        {/* Glow layers */}
        <div
          className="absolute opacity-100 transition-all duration-500 ease-out"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: `${borderRadius * 1.5}px`,
            boxShadow: glowShadow,
          }}
        />
        <div
          className="absolute opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: `${borderRadius * 1.5}px`,
            boxShadow: glowShadowHover,
          }}
        />

        {/* 3D Icon container */}
        <div className="relative">
          {/* Shadow depth layer - Restored 3D effect */}
          <div
            className="absolute inset-0 opacity-70"
            suppressHydrationWarning
            style={{
              background:
                !isMounted || theme === "light"
                  ? "rgba(100, 116, 139, 0.5)"
                  : "rgba(39, 39, 42, 0.8)",
              filter: "blur(1px)",
              borderRadius: `${borderRadius}px`,
              transform: `translate(${depthOffset * 0.5}px, ${depthOffset}px)`,
            }}
          />

          {/* Bottom light reflection line */}
          <div
            className="absolute rounded-full"
            suppressHydrationWarning
            style={{
              bottom: 0,
              left: "10%",
              right: "10%",
              height: `${lightLineHeight}px`,
              transform: `translateY(${lightLineHeight}px)`,
              background:
                !isMounted || theme === "light"
                  ? `linear-gradient(90deg, transparent, ${lightColor}, transparent)`
                  : `linear-gradient(90deg, transparent, ${darkColor}, transparent)`,
              boxShadow:
                !isMounted || theme === "light"
                  ? `0 0 4px ${lightColor}`
                  : `0 0 4px ${darkColor}`,
            }}
          />

          {/* Main icon container - Restored full 3D background and shadows */}
          <div
            className={cn(
              "relative flex items-center justify-center group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-500 ease-out",
              iconClassName,
            )}
            suppressHydrationWarning
            style={{
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: `${borderRadius}px`,
              background:
                !isMounted || theme === "light"
                  ? "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)"
                  : "linear-gradient(135deg, #3f3f46 0%, #27272a 50%, #18181b 100%)",
              boxShadow:
                !isMounted || theme === "light"
                  ? `0 ${size * 0.0625}px ${size * 0.25}px rgba(0, 0, 0, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.8), inset 0 -2px 4px rgba(0, 0, 0, 0.1)`
                  : `0 ${size * 0.0625}px ${size * 0.25}px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.3)`,
            }}
          >
            {/* Inner highlight for glossy 3D effect - Restored */}
            <div
              className="absolute inset-0 opacity-60"
              suppressHydrationWarning
              style={{
                borderRadius: `${borderRadius}px`,
                background:
                  !isMounted || theme === "light"
                    ? "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, transparent 50%)"
                    : "linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
              }}
            />

            <div
              className="relative group-hover:scale-110 transition-transform duration-500 ease-out"
              suppressHydrationWarning
              style={{
                color: !isMounted || theme === "light" ? "#1e293b" : "#f8fafc",
                width: `${image ? imageSize : iconSize}px`,
                height: `${image ? imageSize : iconSize}px`,
                transform: iconParallaxTransform,
                transition: enableParallax
                  ? "transform 0.15s ease-out"
                  : "transform 0.5s ease-out",
              }}
            >
              {image ? (
                <Image
                  src={image || "/placeholder.svg"}
                  alt={label || "Icon"}
                  width={imageSize}
                  height={imageSize}
                  className="object-contain"
                />
              ) : (
                icon
              )}
            </div>
          </div>
        </div>
      </div>

      {label && (
        <div
          className="mt-4 text-center px-2 transition-colors duration-300"
          suppressHydrationWarning
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: 1.4,
            maxWidth: `${size * 1.5}px`,
            color: !isMounted || theme === "light" ? "#3f3f46" : "#e4e4e7",
            transform: labelParallaxTransform,
            transition: enableParallax ? "transform 0.15s ease-out" : "none",
          }}
        >
          <p className="line-clamp-2">{label}</p>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

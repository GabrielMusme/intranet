"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 160, height = 40, className = "" }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Default to light variant during SSR / before mount for consistency
  const src = !isMounted
    ? "/images/intra-intema-light.png"
    : resolvedTheme === "dark"
    ? "/images/intra-intema-dark.png"
    : "/images/intra-intema-light.png";

  return (
    <Image
      src={src}
      alt="Intranet Logo"
      width={width}
      height={height}
      priority
      className={className}
    />
  );
}

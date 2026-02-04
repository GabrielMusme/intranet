"use client";
// import React from "react";
import { useAppMenu } from "@/hooks/use-app-menu";
import type { MenuConfig } from "@/contexts/sidebar-context";

export default function DashboardMenuClient({
  config,
}: {
  config: MenuConfig;
}) {
  useAppMenu(config);
  return null; // o renderiza UI cliente específica si hace falta
}

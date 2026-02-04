"use client";

import React from "react";
import { useAppMenu } from "@/hooks/use-app-menu";
import { projectsMenuConfig} from "./_menu"



export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAppMenu(projectsMenuConfig);

  return <>{children}</>;
}

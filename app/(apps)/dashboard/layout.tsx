"use client";

// import React from "react";
// import type { ReactNode } from "react";
// import { useAppMenu } from "@/hooks/use-app-menu";
import {
  BarChart3,
  Users,
  Settings,
  FileText,
  TrendingUp,
  Database,
  Shield,
  Bell,
} from "lucide-react";
import { MenuConfig } from "@/contexts/sidebar-context";
import DashboardMenu from "./dashboardMenu";

const dashboardMenuConfig: MenuConfig = {
  title: "Dashboard",
  description: "Panel de control principal",
  icon: BarChart3,
  items: [
    {
      id: "overview",
      title: "Resumen",
      icon: BarChart3,
      href: "/dashboard",
      badge: "NEW",
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: TrendingUp,
      children: [
        {
          id: "reports",
          title: "Reportes",
          icon: FileText,
          href: "/dashboard/analytics/reports",
        },
        {
          id: "metrics",
          title: "Métricas",
          icon: BarChart3,
          href: "/dashboard/analytics/metrics",
          badge: 12,
        },
      ],
    },
    {
      id: "users",
      title: "Usuarios",
      icon: Users,
      children: [
        {
          id: "all-users",
          title: "Todos los usuarios",
          href: "/dashboard/users",
        },
        {
          id: "roles",
          title: "Roles y permisos",
          icon: Shield,
          href: "/dashboard/users/roles",
        },
      ],
    },
    {
      id: "data",
      title: "Gestión de datos",
      icon: Database,
      href: "/dashboard/data",
    },
    {
      id: "notifications",
      title: "Notificaciones",
      icon: Bell,
      href: "/dashboard/notifications",
      badge: 5,
    },
    {
      id: "projects",
      title: "Proyectos",
      icon: Settings,
      href: "/projects",
    },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardMenu config={dashboardMenuConfig} />
      {children}
    </>
  );
}

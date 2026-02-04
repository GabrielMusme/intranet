import {
  FolderOpenIcon,
  Plus,
  Play,
  CheckCircle,
  Archive,
  Users,
  Calendar,
  Tag,
  BarChart3,
} from "lucide-react";
import { MenuConfig } from "@/contexts/sidebar-context";

export const projectsMenuConfig: MenuConfig = {
  title: "Projects",
  description: "Gestión de proyectos",
  icon: FolderOpenIcon,
  // image: "/images/projects-icon.png", // Opcional: usar imagen en lugar de icon
  items: [
    {
      id: "overview",
      title: "Todos los proyectos",
      icon: FolderOpenIcon,
      href: "/projects",
    },
    {
      id: "status",
      title: "Por estado",
      icon: Tag,
      children: [
        {
          id: "active",
          title: "Activos",
          icon: Play,
          href: "/projects/active",
          badge: 8,
        },
        {
          id: "completed",
          title: "Completados",
          icon: CheckCircle,
          href: "/projects/completed",
          badge: 24,
        },
        {
          id: "archived",
          title: "Archivados",
          icon: Archive,
          href: "/projects/archived",
        },
      ],
    },
    {
      id: "management",
      title: "Gestión",
      icon: Users,
      children: [
        {
          id: "teams",
          title: "Equipos",
          icon: Users,
          href: "/projects/teams",
        },
        {
          id: "timeline",
          title: "Cronograma",
          icon: Calendar,
          href: "/projects/timeline",
        },
      ],
    },
    {
      id: "new",
      title: "Nuevo proyecto",
      icon: Plus,
      href: "/projects/new",
      badge: "NEW",
    },
    {
      id: "dashboard",
      title: "Dashboard",
      icon: BarChart3,
      href: "/dashboard",
    },
  ],
};
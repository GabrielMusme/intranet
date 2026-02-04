"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface MenuItem {
  id: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: string | number;
  children?: MenuItem[];
}

export interface MenuConfig {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  image?: string;
  items: MenuItem[];
}

interface SidebarContextType {
  // Estado de visibilidad
  isOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;

  // Configuración del menú
  menuConfig: MenuConfig | null;
  setMenuConfig: (config: MenuConfig) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [menuConfig, setMenuConfig] = useState<MenuConfig | null>(null);

  // Responsividad automática
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024; // Cambio a 1024px
      const wasMobile = isMobile;

      setIsMobile(mobile);

      if (mobile) {
        // Si pasamos a mobile/tablet, cerrar automáticamente
        setIsOpen(false);
      } else {
        // Si pasamos a desktop desde mobile/tablet, recuperar estado guardado
        if (wasMobile) {
          const saved = localStorage.getItem("sidebar-open");
          setIsOpen(saved !== null ? JSON.parse(saved) : true);
        }
        // Si ya estábamos en desktop, mantener estado actual
      }
    };

    handleResize(); // Ejecutar al montar
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]); // Agregar isMobile como dependencia

  // Persistencia del estado (solo en desktop)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("sidebar-open", JSON.stringify(isOpen));
    }
  }, [isOpen, isMobile]);

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const closeSidebar = () => setIsOpen(false);
  const openSidebar = () => setIsOpen(true);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isMobile,
        toggleSidebar,
        closeSidebar,
        openSidebar,
        menuConfig,
        setMenuConfig,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}

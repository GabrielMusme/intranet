"use client";

import { useEffect } from "react";
import { useSidebar, MenuConfig } from "@/contexts/sidebar-context";

export function useAppMenu(menuConfig: MenuConfig) {
  const { setMenuConfig } = useSidebar();

  useEffect(() => {
    setMenuConfig(menuConfig);
  }, [menuConfig, setMenuConfig]);

  // Cleanup cuando el componente se desmonta
  useEffect(() => {
    return () => {
      // Opcional: limpiar el menú cuando se desmonta
      // setMenuConfig(null);
    };
  }, []);
}

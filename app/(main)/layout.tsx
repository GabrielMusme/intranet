import type { ReactNode } from "react";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { Topbar } from "@/components/shared/topbar";
// import { DynamicSidebar } from "@/components/shared/sidebar/dynamic-sidebar";
import { Footer } from "@/components/shared/footer";
import "@/app/globals.css";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        <Topbar />
        <div className="flex flex-1 relative">
          {/* <DynamicSidebar /> */}
          <main className="flex-1 lg:transition-all lg:duration-300">
            <div className="m-2 flex flex-col h-full">{children}</div>
          </main>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  );
}
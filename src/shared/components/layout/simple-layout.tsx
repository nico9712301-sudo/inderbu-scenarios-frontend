import { cn } from "@/shared/utils/utils";
import { useSidebar } from "@/shared/providers/dashboard-sidebar.provider";
import {
  GlobeIcon,
  HomeIcon
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { SimpleSidebar } from "./simple-sidebar";
import { NotificationBell } from "../organisms/notification-bell";

interface SimpleLayoutProps {
  children: React.ReactNode;
}

/**
 * AdminBar – top navigation inspired by the WordPress admin bar.
 * Compact, dark background, white/light‑grey text, with quick‑action icons.
 */
function AdminBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 h-12 bg-[#23282d] border-b border-[#14171b] flex items-center p-7 select-none">
      {/* Logo + Title */}
      <div className="flex items-center gap-2 text-gray-100">
        <GlobeIcon className="h-5 w-5" />
        <span className="font-semibold">Escenarios Deportivos Inderbu</span>
      </div>

      {/* Right Section */}
      <div className="ml-auto flex items-center gap-4">
        <NotificationBell />
        <Link
          href={"/"}
          className="flex flex-row items-center gap-2 text-white"
        >
          <HomeIcon className="h-4 w-4" />
          <span>Ver sitio</span>
        </Link>
      </div>
    </header>
  );
}

export function SimpleLayout({ children }: SimpleLayoutProps) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <AdminBar />

      <SimpleSidebar />

      {/* top padding equals AdminBar height */}
      <main
        className={cn(
          "pt-12 lg:pt-12 transition-all duration-300",
          collapsed ? "pl-[72px]" : "pl-[240px]",
        )}
      >
        <div className="p-4">{children}</div>
      </main>

      <footer
        className={cn(
          "p-4 text-xs text-gray-400 transition-all duration-300 ml-5",
          collapsed ? "pl-[72px]" : "pl-[240px]",
        )}
      >
        Escenarios Deportivos Inderbu 2025 • Versión 1.0.0
      </footer>
    </div>
  );
}

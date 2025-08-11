"use client";

import { cn } from "@/shared/utils/utils";
import { useSidebar } from "@/shared/providers/dashboard-sidebar.provider";
import { Button } from "@/shared/ui/button";
import { ChevronLeft, ChevronRight, LogOut, Settings, LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "./data/menu-items";
import { ReactNode } from "react";

// Strategy Pattern
type ActiveStrategy = 'exact' | 'prefix' | 'custom';

interface NavigationItem {
  href: string;
  title: string;
  icon: LucideIcon;
  activeStrategy?: ActiveStrategy;
  customActiveCheck?: (pathname: string, href: string) => boolean;
}

interface SidebarSection {
  items: NavigationItem[];
  withSeparator?: boolean;
}

// Strategy implementations
class LinkActiveChecker {
  static check(pathname: string, href: string, strategy: ActiveStrategy = 'prefix', customCheck?: (pathname: string, href: string) => boolean): boolean {
    switch (strategy) {
      case 'exact':
        return pathname === href;
      
      case 'prefix':
        if (href === "/dashboard") {
          return pathname === href; // Special case for dashboard
        }
        return pathname === href || pathname.startsWith(`${href}/`);
      
      case 'custom':
        return customCheck ? customCheck(pathname, href) : false;
      
      default:
        return false;
    }
  }
}

// Components
function SidebarLink({ item, isActive, collapsed }: { 
  item: NavigationItem; 
  isActive: boolean; 
  collapsed: boolean; 
}) {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-accent text-primary font-medium"
          : "text-gray-500 hover:bg-gray-100 hover:text-primary",
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 mr-2",
          isActive ? "text-primary" : "text-gray-400",
        )}
      />
      {!collapsed && <span>{item.title}</span>}
    </Link>
  );
}

function NavigationSection({ section, pathname, collapsed }: { 
  section: SidebarSection; 
  pathname: string; 
  collapsed: boolean; 
}) {
  return (
    <>
      {section.withSeparator && <div className="my-2 border-t border-gray-200" />}
      <div className="flex flex-col space-y-1">
        {section.items.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            isActive={LinkActiveChecker.check(
              pathname, 
              item.href, 
              item.activeStrategy, 
              item.customActiveCheck
            )}
            collapsed={collapsed}
          />
        ))}
      </div>
    </>
  );
}

// Configuration with Strategy Pattern
function createSidebarConfig(): SidebarSection[] {
  return [
    {
      items: menuItems.map(item => ({
        ...item,
        activeStrategy: 'prefix' as ActiveStrategy
      })),
      withSeparator: false,
    },
    {
      items: [
        {
          href: "/dashboard/options",
          title: "Configuración del sitio",
          icon: Settings,
          activeStrategy: 'prefix' as ActiveStrategy,
        }
      ],
      withSeparator: true,
    },
  ];
}

export function SimpleSidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();
  
  const sidebarConfig = createSidebarConfig();

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-10 bg-white border-r border-gray-200 pt-16 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]",
      )}
    >
      {/* Collapse Button */}
      <div className="absolute right-[-12px] top-20">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full border border-gray-200 bg-white shadow-sm"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </div>

      <div className="flex flex-col space-y-1 p-2 h-[calc(100vh-64px)] justify-between">
        {/* Navigation */}
        <nav className="flex flex-col space-y-1">
          {sidebarConfig.map((section, index) => (
            <NavigationSection
              key={index}
              section={section}
              pathname={pathname}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Logout */}
        <div>
          <div className="mt-2 border-t border-gray-200 mb-2" />
          <button
            className="flex items-center rounded-md px-3 py-2 text-sm transition-colors text-red-500 hover:bg-red-50 w-full"
            onClick={() => console.log("Cerrar sesión")}
          >
            <LogOut className="h-5 w-5 mr-2 text-red-500" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
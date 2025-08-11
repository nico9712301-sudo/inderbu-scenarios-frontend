"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/shared/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  BarChart,
  Bell,
  Calendar,
  ChevronLeft,
  HelpCircle,
  LogOut,
  Map,
  MapPin,
  Settings,
  User,
  UserCircle,
  Users,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { usePathname } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { useEffect, useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/utils/utils";
import type React from "react";


interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    {
      title: "Reservas",
      href: "/",
      icon: Calendar,
    },
    {
      title: "Escenarios",
      href: "/escenarios",
      icon: MapPin,
    },
    {
      title: "Clientes",
      href: "/clientes",
      icon: Users,
    },
    {
      title: "Presidentes",
      href: "/presidentes",
      icon: User,
    },
    {
      title: "Ubicaciones",
      href: "/ubicaciones",
      icon: Map,
    },
    {
      title: "Opciones",
      href: "/opciones",
      icon: Settings,
    },
  ];

  const reportItems = [
    {
      title: "Reservas",
      href: "/reportes/reservas",
      icon: BarChart,
    },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex">
      <Sidebar>
        <SidebarHeader className="h-16 flex items-center justify-between px-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white font-bold">
              ED
            </div>
            <span
              className={cn(
                "font-semibold text-lg transition-opacity duration-300",
                state === "collapsed" ? "opacity-0" : "opacity-100",
              )}
            >
              Inderbu
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-gray-500"
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform duration-300",
                state === "collapsed" ? "rotate-180" : "",
              )}
            />
          </Button>
        </SidebarHeader>

        <SidebarContent className="px-2 py-4">
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                  >
                    <a
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3",
                        isActive ? "text-primary font-medium" : "text-gray-600",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-primary" : "text-gray-500",
                        )}
                      />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>

          <SidebarSeparator className="my-4" />

          <div
            className={cn(
              "px-3 text-xs font-medium text-gray-500 mb-2 transition-opacity duration-300",
              state === "collapsed" ? "opacity-0" : "opacity-100",
            )}
          >
            REPORTES
          </div>

          <SidebarMenu>
            {reportItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                  >
                    <a
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3",
                        isActive ? "text-primary font-medium" : "text-gray-600",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-primary" : "text-gray-500",
                        )}
                      />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="mt-auto border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "flex flex-col transition-opacity duration-300",
                state === "collapsed" ? "opacity-0" : "opacity-100",
              )}
            >
              <span className="text-sm font-medium">Admin Usuario</span>
              <span className="text-xs text-gray-500">
                admin@inderbu.gov.co
              </span>
            </div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold hidden sm:block">
              Escenarios Deportivos Inderbu
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-secondary">
                      3
                    </Badge>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notificaciones</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ayuda</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="animate-fade-in">{children}</div>
        </main>

        <footer className="py-4 px-6 text-xs text-gray-500 border-t bg-white">
          Escenarios Deportivos Inderbu 2025 • Versión 1.0.0
        </footer>
      </div>
    </div>
  );
}

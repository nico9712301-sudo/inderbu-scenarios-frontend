"use client";

import { SimpleLayout } from "@/shared/components/layout/simple-layout";
import { SidebarProvider } from "@/shared/providers/dashboard-sidebar.provider";

export function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SimpleLayout>{children}</SimpleLayout>
    </SidebarProvider>
  );
}
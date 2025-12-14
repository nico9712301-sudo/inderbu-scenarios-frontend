"use client";

import { NotificationProvider } from "@/shared/providers/notification-context.provider";
import { SidebarProvider } from "@/shared/providers/dashboard-sidebar.provider";
import { SimpleLayout } from "@/shared/components/layout/simple-layout";


export function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <NotificationProvider>
        <SimpleLayout>{children}</SimpleLayout>
      </NotificationProvider>
    </SidebarProvider>
  );
}
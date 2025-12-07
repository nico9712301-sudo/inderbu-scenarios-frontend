import { requireAdmin } from "@/shared/utils/auth-guard.server";
import { DashboardClientLayout } from "./dashboard-client-layout";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side auth validation - redirects if not admin
  await requireAdmin();

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}

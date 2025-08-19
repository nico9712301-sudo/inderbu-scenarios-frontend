"use client";

import { IAdminUsersDataClientResponse } from "@/presentation/utils/serialization.utils";
import { AdminUsersPage } from "@/presentation/features/dashboard/admin-users/components/AdminUsersPage";
import { BannersManagementPage } from "../organisms/banners-management-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Settings, Users, Image } from "lucide-react";

interface OptionsPageWithTabsProps {
  currentTab: "admins" | "banners";
  adminUsersData: IAdminUsersDataClientResponse | null;
}

// Tab configuration following your pattern
const OptionsNavValues = [
  {
    value: "admins",
    label: "Administradores",
    icon: <Users className="h-4 w-4" />,
    description: "Gestiona usuarios administradores del sistema",
  },
  {
    value: "banners",
    label: "Banners",
    icon: <Image className="h-4 w-4" />,
    description: "Administra banners y contenido visual de la aplicación",
  },
] as const;

export function OptionsPageWithTabs({
  currentTab,
  adminUsersData,
}: OptionsPageWithTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  console.log({adminUsersData});
  

  // Handle tab change following your established pattern
  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update tab parameter
      params.set("tab", value);

      // Reset pagination when changing tabs
      params.delete("page");
      params.delete("search");

      // Navigate to new URL
      router.push(`/dashboard/options?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Opciones del Sistema
          </h1>
          <p className="text-muted-foreground">
            Administra configuraciones globales y usuarios del sistema
          </p>
        </div>
      </div>

      {/* Tabs Component */}
      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {/* Tabs Navigation */}
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          {OptionsNavValues.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center space-x-2"
            >
              {tab.icon}
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content: Administradores */}
        <TabsContent value="admins" className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            {adminUsersData ? (
              <AdminUsersPage initialData={adminUsersData} />
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">
                  Cargando administradores...
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab Content: Banners */}
        <TabsContent value="banners" className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <BannersManagementPage />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

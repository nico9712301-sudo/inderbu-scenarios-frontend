import { BannersManagementPage } from "@/presentation/features/dashboard/options/components/organisms/banners-management-page";
import { Card } from "@/shared/ui/card";
import { ArrowLeft, Image } from "lucide-react";
import Link from "next/link";

/**
 * Banners Management Page Route (Server Component)
 * 
 * Dedicated page for comprehensive banner management
 * Accessible via /dashboard/options/banners
 */
export default function BannersRoute() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm">
        <Link 
          href="/dashboard/options?tab=banners" 
          className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Opciones</span>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">Gestión de Banners</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
          <Image className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Banners</h1>
          <p className="text-muted-foreground">
            Administra todos los banners y contenido visual de la aplicación
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Card className="p-6">
        <BannersManagementPage />
      </Card>
    </div>
  );
}
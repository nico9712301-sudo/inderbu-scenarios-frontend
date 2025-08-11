"use client";

import { MainHeader } from "@/shared/components/organisms/main-header";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/presentation/features/auth";


export default function ReservationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, authReady } = useAuth();

  useEffect(() => {
    if (!authReady) return;

    if (!isAuthenticated || !user) {
      router.push("/");
      return;
    }

    // Verificar que user.id existe antes de redirigir
    if (!user.id) {
      console.error("User ID is missing from token", user);
      router.push("/");
      return;
    }

    // Redirigir a la página de reservas del usuario específico
    router.push(`/reservations/${user.id}`);
  }, [authReady, isAuthenticated, user, router]);

  // Mostrar loading mientras se redirige
  return (
    <main className="min-h-screen flex flex-col">
      <MainHeader />
      <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Redirigiendo...
          </h2>
          <p className="text-gray-600">Un momento por favor...</p>
        </div>
      </div>
    </main>
  );
}

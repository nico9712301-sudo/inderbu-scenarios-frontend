"use client";

import { MainHeader } from "@/shared/components/organisms/main-header";
import Footer from "@/presentation/features/home/components/organisms/footer";

// Componente de animación shimmer moderna
const ShimmerEffect = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer-modern bg-gradient-to-r from-transparent via-white/30 to-transparent" />
  </div>
);

// Skeleton para tarjeta de reserva
const ReservationCardSkeleton = ({ isActive = true }: { isActive?: boolean }) => (
  <div className="group relative animate-breathe">
    {/* Glow effect */}
    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 animate-pulse-glow" />
    
    <div className="relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Header con badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="h-2 bg-gradient-to-r from-gray-300 to-gray-200 rounded-full w-16 animate-pulse" />
          <div className="h-6 bg-gradient-to-r from-gray-300 to-gray-200 rounded-lg w-32 animate-pulse" />
        </div>
        <div className={`h-6 w-20 rounded-full animate-pulse ${
          isActive 
            ? 'bg-gradient-to-r from-green-200 to-green-300' 
            : 'bg-gradient-to-r from-gray-200 to-gray-300'
        }`} />
      </div>

      {/* Detalles */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-200 rounded animate-pulse" />
          <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-200 rounded w-24 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 rounded animate-pulse" />
          <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-200 rounded animate-pulse" />
          <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-200 rounded w-28 animate-pulse" />
        </div>
      </div>

      {/* Botón de acción */}
      <div className="relative overflow-hidden">
        <div className={`h-10 rounded-lg animate-pulse ${
          isActive 
            ? 'bg-gradient-to-r from-blue-200 to-blue-300' 
            : 'bg-gradient-to-r from-gray-200 to-gray-300'
        }`} />
        <ShimmerEffect className="absolute inset-0" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-blue-300 rounded-full animate-ping opacity-30" />
      <div className="absolute bottom-4 left-4 w-1 h-1 bg-purple-300 rounded-full animate-pulse" />
    </div>
  </div>
);

// Skeleton para stats
const StatSkeleton = ({ color }: { color: string }) => (
  <div className="flex items-center gap-2 group">
    <div className={`w-4 h-4 ${color} rounded animate-pulse`} />
    <div className="h-3 bg-gradient-to-r from-gray-300 to-gray-200 rounded w-16 animate-pulse group-hover:scale-105 transition-transform" />
  </div>
);

// Skeleton para elementos flotantes
const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <div 
    className="animate-float" 
    style={{ animationDelay: `${delay}s` }}
  >
    {children}
  </div>
);

export default function ReservationsLoading() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30">
      {/* Header ya renderizado */}
      <MainHeader />
      
      {/* Hero Section Skeleton */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12 overflow-hidden">
        {/* Decorative blobs */}
        <FloatingElement delay={0}>
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl animate-pulse-glow" />
        </FloatingElement>
        <FloatingElement delay={1.5}>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse-glow" />
        </FloatingElement>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Icon + Title */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-300 rounded animate-breathe" />
            <div className="relative">
              <div className="h-12 md:h-16 w-80 md:w-96 bg-gradient-to-r from-blue-300 to-green-300 rounded-2xl animate-pulse" />
              <ShimmerEffect className="absolute inset-0 rounded-2xl" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 mb-8">
            <div className="h-5 bg-gradient-to-r from-gray-300 to-gray-200 rounded-lg w-96 mx-auto animate-pulse" />
            <div className="h-5 bg-gradient-to-r from-gray-300 to-gray-200 rounded-lg w-80 mx-auto animate-pulse" />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 text-sm">
            <StatSkeleton color="bg-blue-300" />
            <StatSkeleton color="bg-green-300" />
            <StatSkeleton color="bg-amber-300" />
            <StatSkeleton color="bg-gray-300" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex-grow">
        {/* Welcome Banner Skeleton */}
        <div className="mb-8">
          <div className="relative bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 border-2 border-dashed border-blue-200 rounded-xl p-6 overflow-hidden glass-effect">
            {/* Floating elements */}
            
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full animate-breathe" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full animate-ping opacity-20" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="h-6 bg-gradient-to-r from-gray-300 to-gray-200 rounded-lg w-80 animate-pulse" />
                  <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-200 rounded w-96 animate-pulse" />
                  <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-200 rounded w-72 animate-pulse" />
                </div>
                
                {/* Feature cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50 group hover:scale-105 transition-transform">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                          i === 1 ? 'bg-green-300' : i === 2 ? 'bg-blue-300' : 'bg-red-300'
                        }`} />
                        <div className="h-3 bg-gradient-to-r from-gray-300 to-gray-200 rounded w-20 animate-pulse" />
                      </div>
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-24 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters Skeleton */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
                </div>
                <div className="h-10 bg-white border border-gray-200 rounded-lg pl-10 pr-4 animate-pulse relative overflow-hidden">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-32 mt-3 animate-pulse" />
                  <ShimmerEffect className="absolute inset-0" />
                </div>
              </div>
              <div className="h-10 w-20 bg-white border border-gray-200 rounded-lg animate-pulse shrink-0 relative overflow-hidden">
                <ShimmerEffect className="absolute inset-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Reservas Activas Skeleton */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-blue-400 rounded-full animate-pulse-glow" />
              <div className="h-8 bg-gradient-to-r from-gray-300 to-gray-200 rounded-lg w-48 animate-pulse relative overflow-hidden">
                <ShimmerEffect className="absolute inset-0" />
              </div>
              <div className="h-6 w-8 bg-blue-200 rounded-full animate-breathe" />
            </div>
            <div className="hidden md:block h-6 w-40 bg-blue-100 rounded-lg animate-pulse relative overflow-hidden">
              <ShimmerEffect className="absolute inset-0" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <ReservationCardSkeleton key={i} isActive={true} />
            ))}
          </div>
        </section>

        {/* Historial Skeleton */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gray-300 rounded-full animate-pulse" />
              <div className="h-8 bg-gradient-to-r from-gray-300 to-gray-200 rounded-lg w-32 animate-pulse relative overflow-hidden">
                <ShimmerEffect className="absolute inset-0" />
              </div>
              <div className="h-6 w-6 bg-gray-200 rounded-full animate-breathe" />
            </div>
            <div className="hidden md:block h-6 w-48 bg-gray-100 rounded-lg animate-pulse relative overflow-hidden">
              <ShimmerEffect className="absolute inset-0" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((i) => (
              <ReservationCardSkeleton key={i} isActive={false} />
            ))}
          </div>
        </section>

        {/* Pagination Skeleton */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={`h-10 rounded-lg animate-pulse relative overflow-hidden ${
                  i === 2 ? 'w-8 bg-blue-200' : 'w-10 bg-gray-200'
                }`}
              >
                <ShimmerEffect className="absolute inset-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer ya renderizado */}
      <Footer />

      {/* Floating loading indicator */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative animate-float">
          <div className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
        </div>
      </div>

      {/* Loading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse">
          <div className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer-modern" />
        </div>
      </div>
    </main>
  );
}
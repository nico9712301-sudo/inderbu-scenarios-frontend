"use client";

import { MainHeader } from "@/shared/components/organisms/main-header";


// Componente de animación shimmer moderna
const ShimmerEffect = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer-modern bg-gradient-to-r from-transparent via-white/30 to-transparent" />
  </div>
);

// Skeleton para breadcrumb
const BreadcrumbSkeleton = () => (
  <div className="flex items-center gap-2 mb-4">
    <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-200 rounded w-24 animate-pulse" />
    <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-200 rounded w-32 animate-pulse" />
  </div>
);

// Skeleton para badges
const BadgeSkeleton = ({ width = "w-24" }: { width?: string }) => (
  <div className={`h-8 ${width} bg-gradient-to-r from-primary-200 to-primary-300 rounded-full animate-pulse`} />
);

// Skeleton para el header del escenario
const ScenarioHeaderSkeleton = () => (
  <div className="flex flex-col md:flex-row items-start gap-2 mb-6">
    <div className="flex-1 space-y-4">
      <BreadcrumbSkeleton />
      
      {/* Título del escenario */}
      <div className="space-y-2">
        <div className="h-10 bg-gradient-to-r from-primary-300 to-primary-400 rounded-lg w-3/4 animate-pulse" />
        <div className="h-8 bg-gradient-to-r from-primary-200 to-primary-300 rounded-lg w-1/2 animate-pulse" />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-3">
        <BadgeSkeleton width="w-28" />
        <BadgeSkeleton width="w-32" />
        <BadgeSkeleton width="w-24" />
      </div>
    </div>
  </div>
);

// Skeleton para la sección de disponibilidad
const AvailabilitySectionSkeleton = () => (
  <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
    <div className="space-y-4">
      {/* Título */}
      <div className="h-6 bg-gradient-to-r from-gray-300 to-gray-200 rounded w-40 animate-pulse" />
      
      {/* Información de fechas */}
      <div className="space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-64 animate-pulse" />
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-48 animate-pulse" />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        <div className="space-y-1">
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-20 animate-pulse" />
          <div className="h-5 bg-gradient-to-r from-green-200 to-green-300 rounded w-16 animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-24 animate-pulse" />
          <div className="h-5 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-20 animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-28 animate-pulse" />
          <div className="h-5 bg-gradient-to-r from-purple-200 to-purple-300 rounded w-12 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

// Skeleton para el carousel de imágenes
const ImageCarouselSkeleton = () => (
  <div className="relative bg-primary-600 rounded-lg overflow-hidden h-[300px] animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600" />
    <ShimmerEffect className="absolute inset-0" />
    
    {/* Indicadores de carousel */}
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-white/50 rounded-full animate-pulse"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}
    </div>

    {/* Flechas de navegación */}
    <div className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 bg-white/20 rounded-full backdrop-blur-sm animate-pulse" />
    <div className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 bg-white/20 rounded-full backdrop-blur-sm animate-pulse" />
  </div>
);

// Skeleton para la tarjeta de información
const InfoCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
    {/* Header */}
    <div className="p-6 border-b border-gray-100">
      <div className="h-6 bg-gradient-to-r from-gray-300 to-gray-200 rounded w-48 animate-pulse" />
    </div>

    {/* Content */}
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse" />
              <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-200 rounded w-20 animate-pulse" />
            </div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Skeleton para el scheduler
const SchedulerSkeleton = () => (
  <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm p-6">
    <div className="space-y-6">
      {/* Título */}
      <div className="h-7 bg-gradient-to-r from-gray-300 to-gray-200 rounded w-56 animate-pulse" />

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-32 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>

      {/* Calendario/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gradient-to-r from-gray-100 to-gray-50 rounded border border-gray-100 animate-pulse"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default function ScenarioDetailLoading() {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <MainHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Scenario Header Skeleton */}
        <ScenarioHeaderSkeleton />

        {/* Availability Section Skeleton */}
        <AvailabilitySectionSkeleton />

        {/* Main Content Skeleton */}
        <div className="space-y-8">
          {/* Image Carousel and Info Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <ImageCarouselSkeleton />
              <InfoCardSkeleton />
            </div>
          </div>

          {/* Scheduler Skeleton */}
          <SchedulerSkeleton />
        </div>
      </div>
    </main>
  );
}

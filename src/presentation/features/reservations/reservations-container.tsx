"use client";

import { ReservationDto } from "@/services/reservation.service";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Filter, Plus, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiltersCard } from "./components/molecules/filters-card";
import { StatsGrid } from "./components/molecules/stats-grid";
import { CreateReservationModal } from "./components/organisms/create-reservation-modal";
import { ReservationDetailsModal } from "./components/organisms/reservation-details-modal";
import { ReservationsTable } from "./components/organisms/reservations-table";
import { useReservations } from "./hooks/use-reservations.hook";


export const ReservationsContainer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    reservations,
    isLoading,
    stats,
    refetch,
    page,
    pageSize,
    totalReservations,
    changePage,
    // Nuevos campos para filtros
    filters,
    handleFiltersChange,
    clearFilters,
    meta,
  } = useReservations();
  const [showFilters, setShowFilters] = useState(false);
  const [creating, setCreating] = useState(false);
  const [viewingDetails, setViewingDetails] = useState<ReservationDto | null>(
    null,
  );

  // Si la URL no tiene paramétros de paginación, añadirlos al cargar
  useEffect(() => {
    if (!searchParams.has("page") && !searchParams.has("pageSize")) {
      // Solo actualizar la URL si realmente no hay paramétros
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("pageSize", "7");
      router.replace(`/dashboard?${params.toString()}`);
    }
  }, [router, searchParams]);

  // Verificar si hay filtros activos
  const hasActiveFilters =
    filters.scenarioId ||
    filters.activityAreaId ||
    filters.neighborhoodId ||
    filters.userId ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">Reservas</h1>
          {hasActiveFilters && (
            <p className="text-sm text-gray-600 mt-1">
              Mostrando {meta.totalItems} de {meta.totalItems} reservas con
              filtros aplicados
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters((p) => !p)}
            className={showFilters ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                !
              </Badge>
            )}
          </Button>
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nueva Reserva
          </Button>
        </div>
      </div>

      {/* Indicadores de filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          <Badge variant="outline" className="flex items-center gap-1">
            Filtros de selección activos
            <button
              onClick={clearFilters}
              className="ml-1 hover:bg-gray-200 rounded"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}

      <StatsGrid stats={stats} />

      <FiltersCard
        open={showFilters}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearFilters}
      />

      <ReservationsTable
        reservations={reservations}
        isLoading={isLoading}
        onEdit={setViewingDetails}
        page={page}
        pageSize={pageSize}
        totalItems={totalReservations}
        onPageChange={changePage}
      />

      <ReservationDetailsModal
        reservation={viewingDetails}
        onClose={() => setViewingDetails(null)}
      />

      
      <CreateReservationModal
        open={creating}
        onClose={() => setCreating(false)}
        onSuccess={() => {
          refetch();
          setCreating(false);
        }}
      />
    </section>
  );
};

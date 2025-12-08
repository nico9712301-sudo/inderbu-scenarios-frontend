"use client";

import { ReservationDetailsModal } from "@/presentation/features/reservations/components/organisms/reservation-details-modal";
import { CreateReservationModal } from "@/presentation/features/reservations/components/organisms/create-reservation-modal";
import { BulkStateChangeModal } from "@/presentation/features/reservations/components/organisms/bulk-state-change-modal";
import { DashboardReservationsResponse } from "../application/GetDashboardReservationsUseCase";
import { useDashboardReservationsData } from "../hooks/use-dashboard-reservations-data";
import { FiltersCard } from "@/presentation/features/reservations/components/molecules/filters-card";
import { DashboardReservationsTable } from "./organisms/dashboard-reservations-table";
import { StatsGrid } from "@/presentation/features/reservations/components/molecules/stats-grid";
import { ReservationDto } from "@/entities/reservation/model/types";
import { useState, useTransition } from "react";
import { Filter, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { PageMeta } from "@/shared/hooks/use-dashboard-pagination";


interface DashboardReservationsPageProps {
  initialData: DashboardReservationsResponse;
}

interface IStats {
  total: number;
  today: number;
  approved: number;
  pending: number;
  rejected: number;
  activeScenarios: number;
  registeredClients: number;
}

export function DashboardReservationsPage({ initialData }: DashboardReservationsPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition(); // For handling async state updates

  // Pagination and filters using standardized hook
  const {
    filters: paginationFilters,
    onPageChange,
    onLimitChange,
    onSearch,
    onFilterChange,
    buildPageMeta,
  } = useDashboardReservationsData();

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [creating, setCreating] = useState(false);
  const [viewingDetails, setViewingDetails] = useState<ReservationDto | null>(null);

  // Bulk actions state
  const [selectedReservationIds, setSelectedReservationIds] = useState<Set<number>>(new Set());
  const [showBulkStateModal, setShowBulkStateModal] = useState(false);

  // Use initial data directly (will update on SSR re-render)
  const reservations: any[] = initialData.reservations;
  const stats: IStats = initialData.stats;

  // Build page meta from initial data
  const pageMeta: PageMeta = buildPageMeta(initialData.meta.totalItems);

  // Extract advanced filters from URL (non-pagination filters)
  const advancedFilters = {
    scenarioId: paginationFilters.scenarioId,
    activityAreaId: paginationFilters.activityAreaId,
    neighborhoodId: paginationFilters.neighborhoodId,
    userId: paginationFilters.userId,
    dateFrom: paginationFilters.dateFrom,
    dateTo: paginationFilters.dateTo,
    reservationStateIds: paginationFilters.reservationStateIds,
  };

  // Check for active filters
  const hasActiveFilters = Object.entries(advancedFilters).some(([key, value]) => {
    if (key === 'reservationStateIds') {
      return Array.isArray(value) && value.length > 0;
    }
    return value !== undefined;
  });

  const handleFiltersChange = (newFilters: any) => {
    startTransition(() => {
      onFilterChange(newFilters);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      onFilterChange({
        scenarioId: undefined,
        activityAreaId: undefined,
        neighborhoodId: undefined,
        userId: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        reservationStateIds: undefined,
        search: ""
      });
    });
  };

  const refetch = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  // Bulk actions handlers
  const handleSelectionChange = (reservationId: number, selected: boolean) => {
    setSelectedReservationIds(prev => {
      const newSelection = new Set(prev);
      if (selected) {
        newSelection.add(reservationId);
      } else {
        newSelection.delete(reservationId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedReservationIds(new Set(reservations.map(r => r.id)));
    } else {
      setSelectedReservationIds(new Set());
    }
  };

  const handleBulkAction = () => {
    if (selectedReservationIds.size > 0) {
      setShowBulkStateModal(true);
    }
  };

  const handleBulkStateModalClose = () => {
    setShowBulkStateModal(false);
  };

  const handleBulkUpdateSuccess = () => {
    // Clear selection after successful bulk update
    setSelectedReservationIds(new Set());

    // Refetch data
    refetch();
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">Reservas</h1>
          {hasActiveFilters && (
            <p className="text-sm text-gray-600 mt-1">
              Mostrando {pageMeta?.totalItems} de {pageMeta?.totalItems} reservas con filtros aplicados
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/*<Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nueva Reserva
          </Button>*/}
        </div>
      </div>

      {/* Active filters indicator */}
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

      <FiltersCard
        open={showFilters}
        filters={advancedFilters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearFilters}
      />

      <DashboardReservationsTable
        reservations={reservations}
        meta={pageMeta}
        loading={isPending}
        filters={{
          page: pageMeta?.page || 1,
          search: paginationFilters.search || '',
        }}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        onSearch={onSearch}
        onEdit={setViewingDetails}
        selectedIds={selectedReservationIds}
        onSelectionChange={handleSelectionChange}
        onSelectAll={handleSelectAll}
        onBulkAction={handleBulkAction}
      />

      <ReservationDetailsModal
        reservation={viewingDetails}
        onClose={() => setViewingDetails(null)}
        onStatusChange={() => {
          // Refrescar datos del dashboard tras cambio de estado
          refetch();
        }}
      />

      <CreateReservationModal
        open={creating}
        onClose={() => setCreating(false)}
        onSuccess={() => {
          setCreating(false);
          // Give cache invalidation time to process before refresh
          setTimeout(() => {
            refetch();
          }, 100);
        }}
      />

      <BulkStateChangeModal
        open={showBulkStateModal}
        selectedReservationIds={selectedReservationIds}
        onClose={handleBulkStateModalClose}
        onSuccess={handleBulkUpdateSuccess}
      />
    </section>
  );
}

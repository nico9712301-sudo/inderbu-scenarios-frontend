"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  Plus,
  Search,
  User,
  X,
} from "lucide-react";
import {
  PaginatedReservations,
  ReservationDto,
} from "@/entities/reservation/model/types";
import { useReservationsWidget } from "../../hooks/use-reservation-widget.hook";
import { useRouter } from "next/navigation";
import { useState } from "react";

// UI Components
import { ModifyReservationModal } from "@/presentation/features/reservations/components/organisms/modify-reservation-modal";
import { WelcomeBanner } from "./reservations-welcome-banner.component";
import { ReservationsContent } from "./reservations-content.component";
import { ErrorLoadingComponent } from "./error-loading.component";
import { LoadingState } from "./loading-state.component";
import { EmptyState } from "./empty-state.component";
import { HeroStats } from "./hero-stats.component";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";

interface ReservationsContainerProps {
  userId: number;
  initialData?: PaginatedReservations | null;
}

export function ReservationsContainer({
  userId,
  initialData,
}: ReservationsContainerProps) {
  const router = useRouter();

  // Local UI state
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Widget hook
  const {
    data: reservations,
    activeReservations,
    pastReservations,
    meta,
    stats,
    isLoading,
    isFetching,
    error,
    filters,
    updateFilters,
    clearFilters,
    changePage,
    refetch,
    invalidateAndRefetch,
  } = useReservationsWidget({
    userId,
    initialData,
  });

  // Handlers
  const handleModifyReservation = (reservation: ReservationDto) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleReservationUpdated = () => {
    invalidateAndRefetch();
  };

  const handleReservationCancelled = (reservationId: number) => {
    // Update data immediately
    invalidateAndRefetch();
  };

  const handleCreateNewReservation = (subScenarioId: number) => {
    router.push(`/scenario/${subScenarioId}`);
  };

  const handleSearchChange = (searchQuery: string) => {
    updateFilters({ searchQuery });
  };

  // Error state
  if (error) <ErrorLoadingComponent refetch={refetch} />;

  return (
    <div className="space-y-8">
      {/* Hero Section with Stats */}
      <HeroStats stats={stats} />
      <div className="container mx-auto px-4">
        {/* Loading indicator for refetching */}
        {isFetching && !isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Actualizando reservas...</span>
            </div>
          </div>
        )}

        {/* Welcome banner for new users */}
        {reservations.length > 0 && reservations.length <= 3 && (
          <WelcomeBanner />
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar reservas..."
                  value={filters.searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="shrink-0"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {filters.searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Filtros activos
                  <button
                    onClick={clearFilters}
                    className="ml-1 hover:bg-gray-200 rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <Button onClick={() => router.push("/")} className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Reserva
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingState />
        ) : reservations.length === 0 ? (
          <EmptyState
            hasFilters={!!filters.searchQuery}
            onClearFilters={clearFilters}
            onCreateNew={() => router.push("/")}
          />
        ) : (
          <ReservationsContent
            activeReservations={activeReservations}
            pastReservations={pastReservations}
            onEdit={handleModifyReservation}
            onCancelled={handleReservationCancelled}
            pagination={{
              currentPage: meta.page,
              totalPages: meta.totalPages,
            }}
            onPageChange={changePage}
          />
        )}

        {/* Modal */}
        <ModifyReservationModal
          reservation={selectedReservation}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onReservationUpdated={handleReservationUpdated}
          onCreateNewReservation={handleCreateNewReservation}
        />
      </div>
    </div>
  );
}

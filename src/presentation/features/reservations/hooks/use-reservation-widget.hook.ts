"use client";

import { reservationQueryKeys } from "@/entities/reservation/api/reservation-query-keys";
import { ReservationRepository } from "@/entities/reservation/domain/reservation.domain";
import { createReservationRepository } from "@/entities/reservation/infrastructure/reservation-repository.adapter";
import {
  GetReservationsQuery,
  PaginatedReservations,
  calculateReservationStats,
  isActiveReservation,
  isPastReservation,
} from "@/entities/reservation/model/types";
import {
  ClientHttpClient,
  ClientHttpClientFactory,
  createClientAuthContext,
} from "@/shared/api/http-client-client";
import {
  createServerAuthContext,
  ServerAuthContext,
} from "@/shared/api/server-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

interface UseReservationsWidgetProps {
  userId: number;
  initialData?: PaginatedReservations | null;
  initialFilters?: Partial<GetReservationsQuery>;
}

interface ReservationsFilters {
  searchQuery: string;
  page: number;
  limit: number;
}

export function useReservationsWidget({
  userId,
  initialData = null,
  initialFilters = {},
}: UseReservationsWidgetProps) {
  const queryClient = useQueryClient();

  // Local filter state
  const [filters, setFilters] = useState<ReservationsFilters>({
    searchQuery: initialFilters.searchQuery || "",
    page: initialFilters.page || 1,
    limit: initialFilters.limit || 6,
  });

  // Create repository
  const createRepository = () => {
    // Use cookies for httpOnly authentication instead of localStorage
    // const authContext: ServerAuthContext = createServerAuthContext();
    const authContext = createClientAuthContext();
    const httpClient: ClientHttpClient =
      ClientHttpClientFactory.createClient(authContext);
    return createReservationRepository(httpClient);
  };

  // Query for reservations
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: reservationQueryKeys.list({
      userId,
      ...filters,
      searchQuery: filters.searchQuery || undefined,
    }),
    queryFn: async () => {
      const repository = createRepository();
      return repository.getByUserId(userId, {
        page: filters.page,
        limit: filters.limit,
        searchQuery: filters.searchQuery || undefined,
      });
    },
    initialData:
      filters.searchQuery === "" && filters.page === 1
        ? initialData
        : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.statusCode >= 400 && error?.statusCode < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Derived data
  const { activeReservations, pastReservations, stats } = useMemo(() => {
    if (!data?.data) {
      return {
        activeReservations: [],
        pastReservations: [],
        stats: {
          total: 0,
          active: 0,
          past: 0,
          pending: 0,
          confirmed: 0,
          rejected: 0,
          cancelled: 0,
        },
      };
    }

    const active = data.data.filter(isActiveReservation);
    const past = data.data.filter(isPastReservation);
    const statistics = calculateReservationStats(data.data);

    return {
      activeReservations: active,
      pastReservations: past,
      stats: {
        ...statistics,
        // Use meta total for accurate count across pages
        total: data.meta?.totalItems || data.data.length,
      },
    };
  }, [data]);

  // Filter handlers
  const updateFilters = (newFilters: Partial<ReservationsFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      // Reset page when other filters change (except when changing page itself)
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      page: 1,
      limit: filters.limit,
    });
  };

  const changePage = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Optimistic update helper
  const updateReservationOptimistically = (
    reservationId: number,
    updater: (reservation: any) => any
  ) => {
    queryClient.setQueriesData(
      { queryKey: reservationQueryKeys.lists() },
      (oldData: any) => {
        if (!oldData?.data) return oldData;

        return {
          ...oldData,
          data: oldData.data.map((reservation: any) =>
            reservation.id === reservationId
              ? updater(reservation)
              : reservation
          ),
        };
      }
    );
  };

  // Manual refetch with error handling
  const handleRefetch = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error refetching reservations:", error);
    }
  };

  // Invalidate and refetch from server
  const invalidateAndRefetch = () => {
    queryClient.invalidateQueries({
      queryKey: reservationQueryKeys.list({ userId }),
    });
  };

  return {
    // Data
    data: data?.data || [],
    activeReservations,
    pastReservations,
    meta: data?.meta || {
      page: filters.page,
      limit: filters.limit,
      totalItems: 0,
      totalPages: 0,
    },
    stats,

    // State
    isLoading,
    isFetching,
    error: error as Error | null,
    filters,

    // Actions
    updateFilters,
    clearFilters,
    changePage,
    refetch: handleRefetch,
    invalidateAndRefetch,
    updateReservationOptimistically,

    // Query client for advanced usage
    queryClient,
  };
}

// Hook for individual reservation operations
export function useReservationOperations(userId: number) {
  const queryClient = useQueryClient();

  const invalidateReservations = () => {
    queryClient.invalidateQueries({
      queryKey: reservationQueryKeys.list({ userId }),
    });
  };

  const optimisticUpdateReservation = (
    reservationId: number,
    updater: (reservation: any) => any
  ) => {
    queryClient.setQueriesData(
      { queryKey: reservationQueryKeys.lists() },
      (oldData: any) => {
        if (!oldData?.data) return oldData;

        return {
          ...oldData,
          data: oldData.data.map((reservation: any) =>
            reservation.id === reservationId
              ? { ...reservation, ...updater(reservation) }
              : reservation
          ),
        };
      }
    );
  };

  const removeReservationOptimistically = (reservationId: number) => {
    queryClient.setQueriesData(
      { queryKey: reservationQueryKeys.lists() },
      (oldData: any) => {
        if (!oldData?.data) return oldData;

        return {
          ...oldData,
          data: oldData.data.filter(
            (reservation: any) => reservation.id !== reservationId
          ),
          meta: {
            ...oldData.meta,
            totalItems: Math.max(0, oldData.meta.totalItems - 1),
          },
        };
      }
    );
  };

  return {
    invalidateReservations,
    optimisticUpdateReservation,
    removeReservationOptimistically,
  };
}

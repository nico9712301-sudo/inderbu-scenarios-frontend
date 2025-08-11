"use client";

import { useDashboardPagination } from "@/shared/hooks/use-dashboard-pagination";

export function useDashboardReservationsData() {
  const {
    filters,
    onPageChange,
    onLimitChange,
    onSearch,
    onFilterChange,
    buildPageMeta,
  } = useDashboardPagination({
    baseUrl: '/dashboard',
    defaultLimit: 7,
  });

  return {
    filters,
    onPageChange,
    onLimitChange,
    onSearch,
    onFilterChange,
    buildPageMeta,
  };
}
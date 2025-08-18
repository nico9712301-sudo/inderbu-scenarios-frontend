"use client";

import { useDashboardPagination } from "@/shared/hooks/use-dashboard-pagination";
import { IClientsDataClientResponse } from "@/presentation/utils/serialization.utils";

export function useClientsData(initialData: IClientsDataClientResponse) {

  const pagination = useDashboardPagination({
    baseUrl: "/dashboard/clients",
    defaultLimit: 10,
  });
  
  // Default meta if not provided
  const defaultMeta = {
    page: 1,
    limit: 10,
    totalItems: initialData.users?.length || 0,
    totalPages: Math.ceil((initialData.users?.length || 0) / 10),
    hasNext: false,
    hasPrev: false,
  };

  // Handle filter changes
  const handleRoleChange = (roleId: string) => {
    pagination.onFilterChange({
      roleId: roleId === "all" ? undefined : [parseInt(roleId)],
    });
  };

  const handleNeighborhoodChange = (neighborhoodId: string) => {
    pagination.onFilterChange({
      neighborhoodId:
        neighborhoodId === "all" ? undefined : neighborhoodId || undefined,
    });
  };

  const handleStatusChange = (isActive: string) => {
    pagination.onFilterChange({
      isActive: isActive === "all" ? undefined : isActive || undefined,
    });
  };
  
  return {
    ...pagination,
    users: initialData.users || [],
    roles: initialData.roles || [],
    neighborhoods: initialData.neighborhoods || [],
    meta: initialData.meta || defaultMeta,
    buildPageMeta: pagination.buildPageMeta, // Exponer buildPageMeta
    handleRoleChange,
    handleNeighborhoodChange,
    handleStatusChange,
  };
}
"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export interface PaginationFilters {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

export interface PaginationConfig {
  baseUrl: string;
  defaultLimit?: number;
  defaultPage?: number;
}

export interface PageMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Hook estandarizado para paginación en dashboard
 * Basado en los mejores patrones de Locations y Scenarios
 * 
 * @param config - Configuración de la paginación
 * @returns Filtros, handlers y utilidades de paginación
 */
export function useDashboardPagination(config: PaginationConfig) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { baseUrl, defaultLimit = 10, defaultPage = 1 } = config;

  // ─── Extract filters from URL (memoized) ───────────────────────────────────
  const filters = useMemo(() => {
    const result: PaginationFilters = {
      page: searchParams.get('page') ? Number(searchParams.get('page')) : defaultPage,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : defaultLimit,
      search: searchParams.get('search') || "",
    };

    // Extract any additional filters from URL
    for (const [key, value] of searchParams.entries()) {
      if (!['page', 'limit', 'search'].includes(key)) {
        // Try to parse as number if possible, otherwise keep as string
        const numValue = Number(value);
        result[key] = isNaN(numValue) ? value : numValue;
      }
    }

    return result;
  }, [searchParams, defaultLimit, defaultPage]);

  // ─── URL Update Function ───────────────────────────────────────────────────
  const updateUrl = useCallback((newFilters: PaginationFilters) => {
    const params = new URLSearchParams();
    
    // Add page only if not default
    if (newFilters.page && newFilters.page > 1) {
      params.set('page', newFilters.page.toString());
    }
    
    // Add limit only if not default
    if (newFilters.limit && newFilters.limit !== defaultLimit) {
      params.set('limit', newFilters.limit.toString());
    }
    
    // Add search if present
    if (newFilters.search) {
      params.set('search', newFilters.search);
    }
    
    // Add any additional filters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (!['page', 'limit', 'search'].includes(key) && value !== undefined && value !== '') {
        params.set(key, value.toString());
      }
    });

    const queryString = params.toString();
    const newUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    
    // Navigate to new URL (Next.js App Router should auto-refresh server components)
    router.push(newUrl);
  }, [router, baseUrl, defaultLimit]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const onPageChange = useCallback((page: number) => {
    updateUrl({ ...filters, page });
  }, [filters, updateUrl]);

  const onLimitChange = useCallback((limit: number) => {
    updateUrl({ ...filters, limit, page: 1 }); // Reset to page 1 on limit change
  }, [filters, updateUrl]);

  const onSearch = useCallback((search: string) => {
    updateUrl({ ...filters, search, page: 1 }); // Reset to page 1 on search
  }, [filters, updateUrl]);

  const onFilterChange = useCallback((newFilters: Partial<PaginationFilters>) => {
    updateUrl({ ...filters, ...newFilters, page: 1 }); // Reset to page 1 on filter change
  }, [filters, updateUrl]);

  const onReset = useCallback(() => {
    updateUrl({ page: defaultPage, limit: defaultLimit, search: "" });
  }, [updateUrl, defaultPage, defaultLimit]);

  // ─── Utility Functions ─────────────────────────────────────────────────────
  const buildPageMeta = useCallback((totalItems: number): PageMeta => {
    const { page = defaultPage, limit = defaultLimit } = filters;
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }, [filters, defaultPage, defaultLimit]);

  const getQueryParams = useCallback(() => {
    return filters;
  }, [filters]);


  // ─── URL Query String for Server-side ─────────────────────────────────────
  const getServerParams = useCallback(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  return {
    // Current state
    filters,
    
    // Handlers
    onPageChange,
    onLimitChange,
    onSearch,
    onFilterChange,
    onReset,
    
    // Utilities
    buildPageMeta,
    getQueryParams,
    getServerParams,
    updateUrl,
  };
}
"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useMultiEntityPagination, PageMeta } from "@/shared/hooks/use-dashboard-pagination";
import { Commune, Neighborhood } from "@/services/api";
import { City } from "../domain/repositories/ILocationRepository";

// Simular servicios - en una implementación real estos vendrían de la API
const mockCommuneService = {
  async getAll(params: { page: number; limit: number; search?: string }) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock data - en una implementación real esto vendría del backend
    const allCommunes = [
      { id: 1, name: "Comuna 1", city: { id: 1, name: "Santiago" } },
      { id: 2, name: "Comuna 2", city: { id: 1, name: "Santiago" } },
      { id: 3, name: "Comuna 3", city: { id: 2, name: "Valparaíso" } },
      { id: 4, name: "Comuna 4", city: { id: 1, name: "Santiago" } },
      { id: 5, name: "Comuna 5", city: { id: 3, name: "Concepción" } },
    ];
    
    let filtered = allCommunes;
    if (params.search) {
      filtered = allCommunes.filter(c => 
        c.name.toLowerCase().includes(params.search!.toLowerCase())
      );
    }
    
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / params.limit);
    const start = (params.page - 1) * params.limit;
    const data = filtered.slice(start, start + params.limit);
    
    return {
      data,
      meta: {
        page: params.page,
        limit: params.limit,
        totalItems,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPreviousPage: params.page > 1,
      }
    };
  }
};

const mockNeighborhoodService = {
  async getAll(params: { page: number; limit: number; search?: string }) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock data - en una implementación real esto vendría del backend
    const allNeighborhoods = [
      { id: 1, name: "Barrio 1", commune: { id: 1, name: "Comuna 1" } },
      { id: 2, name: "Barrio 2", commune: { id: 1, name: "Comuna 1" } },
      { id: 3, name: "Barrio 3", commune: { id: 2, name: "Comuna 2" } },
      { id: 4, name: "Barrio 4", commune: { id: 2, name: "Comuna 2" } },
      { id: 5, name: "Barrio 5", commune: { id: 3, name: "Comuna 3" } },
      { id: 6, name: "Barrio 6", commune: { id: 1, name: "Comuna 1" } },
    ];
    
    let filtered = allNeighborhoods;
    if (params.search) {
      filtered = allNeighborhoods.filter(n => 
        n.name.toLowerCase().includes(params.search!.toLowerCase())
      );
    }
    
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / params.limit);
    const start = (params.page - 1) * params.limit;
    const data = filtered.slice(start, start + params.limit);
    
    return {
      data,
      meta: {
        page: params.page,
        limit: params.limit,
        totalItems,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPreviousPage: params.page > 1,
      }
    };
  }
};

export function useLocationsData() {
  const initialRender = useRef(true);

  // Multi-entity pagination hook
  const {
    getFiltersForEntity,
    updateEntityPage,
  } = useMultiEntityPagination('/dashboard/locations', ['commune', 'neighborhood']);

  // Get filters for each entity
  const communeFilters = {
    ...getFiltersForEntity('commune'),
    search: getFiltersForEntity('commune').search || '',
  };
  const neighborhoodFilters = {
    ...getFiltersForEntity('neighborhood'), 
    search: getFiltersForEntity('neighborhood').search || '',
  };

  // State for both entities
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [communePageMeta, setCommunePageMeta] = useState<PageMeta | null>(null);
  const [neighborhoodPageMeta, setNeighborhoodPageMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoize query params to avoid infinite loops
  const communeQueryParams = useMemo(() => ({
    page: communeFilters.page,
    limit: communeFilters.limit,
    search: communeFilters.search,
  }), [communeFilters.page, communeFilters.limit, communeFilters.search]);

  const neighborhoodQueryParams = useMemo(() => ({
    page: neighborhoodFilters.page,
    limit: neighborhoodFilters.limit,
    search: neighborhoodFilters.search,
  }), [neighborhoodFilters.page, neighborhoodFilters.limit, neighborhoodFilters.search]);

  // Fetch communes
  const fetchCommunes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mockCommuneService.getAll(communeQueryParams);
      setCommunes(res.data);
      setCommunePageMeta({
        page: res.meta.page,
        limit: res.meta.limit,
        totalItems: res.meta.totalItems,
        totalPages: res.meta.totalPages,
        hasNext: res.meta.hasNextPage,
        hasPrev: res.meta.hasPreviousPage,
      });
    } catch (err) {
      console.error('Error fetching communes:', err);
    } finally {
      setLoading(false);
    }
  }, [communeQueryParams]);

  // Fetch neighborhoods
  const fetchNeighborhoods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mockNeighborhoodService.getAll(neighborhoodQueryParams);
      setNeighborhoods(res.data);
      setNeighborhoodPageMeta({
        page: res.meta.page,
        limit: res.meta.limit,
        totalItems: res.meta.totalItems,
        totalPages: res.meta.totalPages,
        hasNext: res.meta.hasNextPage,
        hasPrev: res.meta.hasPreviousPage,
      });
    } catch (err) {
      console.error('Error fetching neighborhoods:', err);
    } finally {
      setLoading(false);
    }
  }, [neighborhoodQueryParams]);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      // Load cities (static data)
      setCities([
        { id: 1, name: "Santiago" },
        { id: 2, name: "Valparaíso" },
        { id: 3, name: "Concepción" },
      ]);

      // Load initial communes and neighborhoods
      await Promise.all([fetchCommunes(), fetchNeighborhoods()]);
    };

    if (initialRender.current) {
      initialRender.current = false;
      loadInitialData();
    }
  }, []);

  // Effect for communes when filters change
  useEffect(() => {
    if (!initialRender.current) {
      fetchCommunes();
    }
  }, [fetchCommunes]);

  // Effect for neighborhoods when filters change  
  useEffect(() => {
    if (!initialRender.current) {
      fetchNeighborhoods();
    }
  }, [fetchNeighborhoods]);

  // Navigation handlers
  const handleCommunePageChange = (newPage: number) => {
    updateEntityPage('commune', newPage);
  };

  const handleNeighborhoodPageChange = (newPage: number) => {
    updateEntityPage('neighborhood', newPage);
  };

  const handleCommuneSearch = (searchTerm: string) => {
    // Esta funcionalidad requeriría una actualización del hook de multi-entity
    // Por ahora simular con refresh
    window.location.href = `/dashboard/locations?communeSearch=${searchTerm}&communePage=1`;
  };

  const handleNeighborhoodSearch = (searchTerm: string) => {
    // Esta funcionalidad requeriría una actualización del hook de multi-entity  
    // Por ahora simular con refresh
    window.location.href = `/dashboard/locations?neighborhoodSearch=${searchTerm}&neighborhoodPage=1`;
  };

  return {
    // Data
    communes,
    neighborhoods,
    cities,
    allCommunes: communes, // For select options
    communePageMeta,
    neighborhoodPageMeta,
    loading,
    
    // Filters
    communeFilters,
    neighborhoodFilters,
    
    // Handlers
    handleCommunePageChange,
    handleNeighborhoodPageChange,
    handleCommuneSearch,
    handleNeighborhoodSearch,
    
    // Refresh functions
    refetchCommunes: fetchCommunes,
    refetchNeighborhoods: fetchNeighborhoods,
  };
}
import {
  ActivityArea,
  FiltersState,
  Neighborhood,
} from "../types/filters.types";
import { useState } from "react";

interface UseHomeFiltersProps {
  initialActivityAreas: ActivityArea[];
  initialNeighborhoods: Neighborhood[];
}

export function useHomeFilters({
  initialActivityAreas,
  initialNeighborhoods,
}: UseHomeFiltersProps) {
  const [activityAreas] = useState<ActivityArea[]>(initialActivityAreas);
  const [neighborhoods] = useState<Neighborhood[]>(initialNeighborhoods);
  const [filters, setFilters] = useState<FiltersState>({
    activityArea: null,
    neighborhood: null,
    searchQuery: "",
  });

  const updateActivityArea = (id: string | null) => {
    setFilters((prev) => ({ ...prev, activityArea: id }));
  };

  const updateNeighborhood = (id: string | null) => {
    setFilters((prev) => ({ ...prev, neighborhood: id }));
  };

  const updateSearchQuery = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const clearFilters = () => {
    setFilters({
      activityArea: null,
      neighborhood: null,
      searchQuery: "",
    });
  };

  return {
    activityAreas,
    neighborhoods,
    filters,
    updateActivityArea,
    updateNeighborhood,
    updateSearchQuery,
    clearFilters,
  };
}

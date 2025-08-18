"use client";

import { memo, useEffect } from "react";
import { SearchSelect } from "@/shared/components/molecules/search-select";
import { searchRoles, searchNeighborhoods, searchRoleById, searchNeighborhoodById } from "@/presentation/features/home/services/home.service";
import { ClientsSearchInput } from "../atoms/clients-search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export interface ClientsFilters {
  search?: string;
  roleId?: number[];
  neighborhoodId?: string;
  isActive?: string;
}

interface ClientsFiltersCardProps {
  filters: ClientsFilters;
  onSearch: (value: string) => void;
  onRoleChange: (value: string) => void;
  onNeighborhoodChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  showFilters: boolean;
}

export function ClientsFiltersCard({
  filters,
  onSearch,
  onRoleChange,
  onNeighborhoodChange,
  onStatusChange,
  showFilters,
}: ClientsFiltersCardProps) {

  useEffect(() => {
    console.log("Filters updated:", filters);
  }, [filters]);
  
  
  return (
    <div className={`space-y-4 ${showFilters ? "block" : "hidden"} sm:block`}>
      {/* Search bar - full width on mobile */}
      <ClientsSearchInput
        value={filters.search || ""}
        onChange={onSearch}
      />

      {/* Filter selects - responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <SearchSelect
          placeholder="Filtrar por rol"
          searchPlaceholder="Buscar rol..."
          value={filters.roleId && filters.roleId.length === 1 ? filters.roleId[0].toString() : ""}
          onValueChange={(value) => {
            onRoleChange(value ? value.toString() : "all");
          }}
          onSearch={searchRoles}
          onSearchById={searchRoleById}
          emptyMessage="No se encontraron roles"
        />

        <SearchSelect
          placeholder="Filtrar por barrio"
          searchPlaceholder="Buscar barrio..."
          value={filters.neighborhoodId?.toString() || ""}
          onValueChange={(value) => {
            onNeighborhoodChange(value ? value.toString() : "all");
          }}
          onSearch={searchNeighborhoods}
          onSearchById={searchNeighborhoodById}
          emptyMessage="No se encontraron barrios"
        />

        <Select
          value={filters.isActive?.toString() || "all"}
          onValueChange={onStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {[
              {
                value: "true",
                label: "Activos",
              },
              {
                value: "false",
                label: "Inactivos",
              },
            ].map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
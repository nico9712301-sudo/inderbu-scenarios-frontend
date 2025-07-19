"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { searchNeighborhoodsForScenarios } from "../../services/scenarios-search.service";
import { SearchSelect } from "@/shared/components/molecules/search-select";
import { Filter, MapPin, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";


type IScenariosFilters = {
  search: string;
  neighborhoodId?: number;
};

interface ScenariosFiltersCardProps {
  open: boolean;
  filters: IScenariosFilters;
  onFiltersChange: (filters: IScenariosFilters) => void;
  onClearFilters: () => void;
}

export const ScenariosFiltersCard = ({
  open,
  filters,
  onFiltersChange,
  onClearFilters,
}: ScenariosFiltersCardProps) => {
  // ⚠️ TODOS LOS HOOKS DEBEN IR AL INICIO - ANTES DE CUALQUIER RETURN CONDICIONAL
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [localSearchValue, setLocalSearchValue] = useState(
    filters.search || "",
  );

  // Sincronizar estado local con filtros externos (para limpiar correctamente)
  useEffect(() => {
    setLocalSearchValue(filters.search || "");
  }, [filters.search]);

  // AHORA SÍ PODEMOS HACER RETURN CONDICIONAL
  if (!open) return null;

  /* ─────────── Handlers ─────────── */
  const handleNeighborhoodChange = (value: string | number | null) => {
    const val = value === "all" || value === null ? undefined : Number(value);
    onFiltersChange({ ...filters, neighborhoodId: val });
    updateChip(
      "neighborhood",
      val?.toString() ?? "",
      "Barrio seleccionado",
      val !== undefined,
    );
  };

  /* Debounce de búsqueda - SEPARADO del estado local del input */
  const handleSearchChange = (q: string) => {
    // Actualizar inmediatamente el estado local (sin lag)
    setLocalSearchValue(q);

    // Debounce solo para la petición al servidor
    if (searchTimeout.current !== null) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      onFiltersChange({ ...filters, search: q });
      updateChip("search", q, `"${q}"`, q.length > 0);
    }, 300);
  };

  /* ─────────── Chips visuales ─────────── */
  const updateChip = (
    type: string,
    value: string,
    display: string,
    add: boolean,
  ) => {
    setActiveFilters((chips) => {
      const next = [...chips.filter((c) => !c.startsWith(`${type}:`))];
      if (add) next.push(`${type}:${value}:${display}`);
      return next;
    });
  };

  const removeChip = (chip: string) => {
    const [type] = chip.split(":");
    if (type === "neighborhood") handleNeighborhoodChange("all");
    else if (type === "search") {
      setLocalSearchValue(""); // Limpiar estado local
      onFiltersChange({ ...filters, search: "" });
    }
    setActiveFilters((c) => c.filter((x) => x !== chip));
  };

  const clearAllFilters = () => {
    setLocalSearchValue(""); // Limpiar estado local
    onClearFilters();
    setActiveFilters([]);
  };

  return (
    <div className="mb-4 animate-fade-in">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filtros de búsqueda
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span>
              Refina los resultados de escenarios usando los siguientes filtros
            </span>
            {(filters.search || filters.neighborhoodId) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Limpiar todo
              </Button>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm backdrop-blur-sm">
            {/* Fila principal */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              {/* Search por Nombre */}
              <div className="md:col-span-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Buscar por nombre
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Ej: Polideportivo, Cancha Central..."
                    value={localSearchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                  />
                </div>
              </div>

              {/* Barrio */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Barrio
                </label>
                <SearchSelect
                  placeholder="Todos los barrios"
                  searchPlaceholder="Buscar barrio..."
                  icon={MapPin}
                  value={filters.neighborhoodId ?? "all"}
                  onValueChange={handleNeighborhoodChange}
                  onSearch={searchNeighborhoodsForScenarios}
                  emptyMessage="No se encontraron barrios"
                  className="w-full"
                />
              </div>
            </div>

            {/* Chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500 mr-2">
                  Filtros activos:
                </span>
                {activeFilters.map((chip) => {
                  const [, , display] = chip.split(":");
                  return (
                    <Badge
                      key={chip}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer transition-all duration-200 group px-3 py-1"
                      onClick={() => removeChip(chip)}
                    >
                      {display}
                      <X className="w-3 h-3 ml-1 group-hover:text-blue-900" />
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

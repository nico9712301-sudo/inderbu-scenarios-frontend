"use client";

import {
  searchActivityAreasForSubScenarios,
  searchNeighborhoodsForSubScenarios,
  searchScenariosForSubScenarios,
} from "../../api/sub-scenarios-search.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { SearchSelect } from "@/shared/components/molecules/search-select";
import { Building, Filter, MapPin, Search, Tag, X } from "lucide-react";
import { FilterState } from "../../hooks/use-sub-scenario-data";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";


interface SubScenariosFiltersCardProps {
  visible: boolean;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onToggle: () => void;
}

export const SubScenariosFiltersCard = ({
  visible,
  filters,
  onChange,
  onToggle,
}: SubScenariosFiltersCardProps) => {
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
  if (!visible) return null;

  /* ─────────── Handlers ─────────── */
  const handleScenarioChange = (value: string | number | null) => {
    const val = value === "all" || value === null ? undefined : Number(value);
    const newFilters = { ...filters, scenarioId: val };
    onChange(newFilters);
    updateChip(
      "scenario",
      val?.toString() ?? "",
      "Escenario seleccionado",
      val !== undefined,
    );
  };

  const handleActivityAreaChange = (value: string | number | null) => {
    const val = value === "all" || value === null ? undefined : Number(value);
    const newFilters = { ...filters, activityAreaId: val };
    onChange(newFilters);
    updateChip(
      "activity",
      val?.toString() ?? "",
      "Actividad seleccionada",
      val !== undefined,
    );
  };

  const handleNeighborhoodChange = (value: string | number | null) => {
    const val = value === "all" || value === null ? undefined : Number(value);
    const newFilters = { ...filters, neighborhoodId: val };
    onChange(newFilters);
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
      const newFilters = { ...filters, search: q };
      onChange(newFilters);
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
    if (type === "scenario") handleScenarioChange("all");
    else if (type === "activity") handleActivityAreaChange("all");
    else if (type === "neighborhood") handleNeighborhoodChange("all");
    else if (type === "search") {
      setLocalSearchValue(""); // Limpiar estado local
      onChange({ ...filters, search: "" });
    }
    setActiveFilters((c) => c.filter((x) => x !== chip));
  };

  const clearAllFilters = () => {
    setLocalSearchValue(""); // Limpiar estado local
    const clearedFilters: FilterState = {
      search: "",
      scenarioId: undefined,
      activityAreaId: undefined,
      neighborhoodId: undefined,
      page: 1,
      limit: 7,
    };
    onChange(clearedFilters);
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
              Refina los resultados de sub-escenarios usando los siguientes
              filtros
            </span>
            {(filters.search ||
              filters.scenarioId ||
              filters.activityAreaId ||
              filters.neighborhoodId) && (
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
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Search por Nombre */}
              <div className="md:col-span-3">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Buscar por nombre
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Ej: Cancha principal, Piscina..."
                    value={localSearchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                  />
                </div>
              </div>

              {/* Escenario */}
              <div className="md:col-span-3">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Escenario
                </label>
                <SearchSelect
                  placeholder="Todos los escenarios"
                  searchPlaceholder="Buscar escenario..."
                  icon={Building}
                  value={filters.scenarioId ?? "all"}
                  onValueChange={handleScenarioChange}
                  onSearch={searchScenariosForSubScenarios}
                  emptyMessage="No se encontraron escenarios"
                  className="w-full"
                />
              </div>

              {/* Área deportiva */}
              <div className="md:col-span-3">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Actividad
                </label>
                <SearchSelect
                  placeholder="Todas las actividades"
                  searchPlaceholder="Buscar actividad..."
                  icon={Tag}
                  value={filters.activityAreaId ?? "all"}
                  onValueChange={handleActivityAreaChange}
                  onSearch={searchActivityAreasForSubScenarios}
                  emptyMessage="No se encontraron actividades"
                  className="w-full"
                />
              </div>

              {/* Barrio */}
              <div className="md:col-span-3">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Barrio
                </label>
                <SearchSelect
                  placeholder="Todos los barrios"
                  searchPlaceholder="Buscar barrio..."
                  icon={MapPin}
                  value={filters.neighborhoodId ?? "all"}
                  onValueChange={handleNeighborhoodChange}
                  onSearch={searchNeighborhoodsForSubScenarios}
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

            {/* Botón aplicar (mantener compatibilidad con el sistema actual) */}
            <div className="mt-4 flex justify-end">
              <Button onClick={onToggle}>Aplicar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

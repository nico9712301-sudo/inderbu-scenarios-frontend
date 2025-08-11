"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  searchActivityAreas,
  searchNeighborhoods,
} from "../../services/home.service";
import {
  IActivityArea,
  IFilters,
  INeighborhood,
} from "../../types/filters.types";
import { SearchSelect } from "@/shared/components/molecules/search-select";
import { DollarSign, Filter, MapPin, Search, Tag, X } from "lucide-react";
import { Dispatch, SetStateAction, useRef } from "react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";


interface HomeFiltersProps {
  activityAreas: IActivityArea[];
  neighborhoods: INeighborhood[];
  filters: IFilters;
  setFilters: Dispatch<SetStateAction<IFilters>>;
  activeFilters: string[];
  setActiveFilters: Dispatch<SetStateAction<string[]>>;
  clearFilters: () => void;
}

export default function HomeFilters({
  activityAreas,
  neighborhoods,
  filters,
  setFilters,
  activeFilters,
  setActiveFilters,
  clearFilters,
}: HomeFiltersProps) {
  /* ─────────── Handlers ─────────── */
  const handleAreaChange = (value: string | number | null) => {
    const val = value === "all" || value === null ? undefined : Number(value);
    setFilters((f) => ({ ...f, activityAreaId: val }));
    updateChip(
      "area",
      val?.toString() ?? "",
      "Área seleccionada",
      val !== undefined,
    );
  };

  const handleNeighborhoodChange = (value: string | number | null) => {
    const val = value === "all" || value === null ? undefined : Number(value);
    setFilters((f) => ({ ...f, neighborhoodId: val }));
    updateChip(
      "neighborhood",
      val?.toString() ?? "",
      "Barrio seleccionado",
      val !== undefined,
    );
  };

  const handleCostChange = (value: string) => {
    let hasCost: boolean | undefined;
    if (value === "paid") hasCost = true;
    else if (value === "free") hasCost = false;
    setFilters((f) => ({ ...f, hasCost }));
    updateChip(
      "cost",
      value,
      value === "paid"
        ? "Solo de pago"
        : value === "free"
          ? "Solo gratuitos"
          : "",
      value !== "all",
    );
  };

  /* Debounce de búsqueda */
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = (q: string) => {
    if (searchTimeout.current !== null) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      setFilters((f) => ({ ...f, searchQuery: q }));
      updateChip("search", q, `"${q}"`, q.length > 0);
    }, 0);
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
    if (type === "area") handleAreaChange("all");
    else if (type === "neighborhood") handleNeighborhoodChange("all");
    else if (type === "cost") handleCostChange("all");
    else if (type === "search") setFilters((f) => ({ ...f, searchQuery: "" }));
    setActiveFilters((c) => c.filter((x) => x !== chip));
  };

  /* ─────────── Render ─────────── */
  return (
    <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">
          Filtrar escenarios
        </h2>
      </div>

      {/* Fila principal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Search */}
        <div className="md:col-span-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Buscar por nombre
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Ej: Polideportivo, Cancha..."
              value={filters.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50/50 hover:bg-white"
            />
          </div>
        </div>

        {/* Área deportiva */}
        <div className="md:col-span-3">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Área deportiva
          </label>
          <SearchSelect
            placeholder="Todas las áreas"
            searchPlaceholder="Ej: fútbol, baloncesto..."
            icon={Tag}
            value={filters.activityAreaId ?? "all"}
            onValueChange={handleAreaChange}
            onSearch={searchActivityAreas}
            emptyMessage="No se encontraron áreas deportivas"
            className="w-full"
          />
        </div>

        {/* Barrio */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Barrio
          </label>
          <SearchSelect
            placeholder="Todos"
            searchPlaceholder="Ej: centro, laureles..."
            icon={MapPin}
            value={filters.neighborhoodId ?? "all"}
            onValueChange={handleNeighborhoodChange}
            onSearch={searchNeighborhoods}
            emptyMessage="No se encontraron barrios"
            className="w-full"
          />
        </div>

        {/* Costo */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Costo
          </label>
          <Select
            value={
              filters.hasCost === undefined
                ? "all"
                : filters.hasCost
                  ? "paid"
                  : "free"
            }
            onValueChange={handleCostChange}
          >
            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/50 hover:bg-white transition-all duration-200">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Todos" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="free">Solo gratuitos</SelectItem>
              <SelectItem value="paid">Solo de pago</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botón limpiar */}
        <div className="md:col-span-1">
          {activeFilters.length > 0 && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-200"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500 mr-2">Filtros activos:</span>
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
  );
}

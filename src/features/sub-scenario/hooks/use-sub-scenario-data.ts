"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";

import {
  ActivityArea,
  Neighborhood,
  Scenario,
  SubScenario,
  UpdateSubScenarioDto,
} from "@/services/api";
import {
  useDashboardPagination,
  PageMeta,
} from "@/shared/hooks/use-dashboard-pagination";
import { SubScenarioCommandFactory } from "@/features/dashboard/sub-scenarios/commands/sub-scenario-commands";
import { createSubScenarioAction } from "@/features/dashboard/sub-scenarios/actions/sub-scenario.actions";

export interface ISubScenarioFilters {
  search: string;
  scenarioId?: number;
  activityAreaId?: number;
  neighborhoodId?: number;
  active?: boolean;
}

export function useSubScenarioData() {

  // ─── Use standardized pagination hook ─────────────────────────────────────────────────────────────
  const pagination = useDashboardPagination({
    baseUrl: "/dashboard/sub-scenarios",
    defaultLimit: 7,
  });

  // ─── Internal State ────────────────────────────────────────────────────────────────────────────
  const [subScenarios, setSubScenarios] = useState<SubScenario[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activityAreas, setActivityAreas] = useState<ActivityArea[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [fieldSurfaceTypes, setSurface] = useState<
    { id: number; name: string }[]
  >([]);
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Extract specific filters from pagination ──────────────────────────────────────────────────
  const filters: ISubScenarioFilters = {
    search: pagination.filters.search || "",
    scenarioId: pagination.filters.scenarioId as number | undefined,
    activityAreaId: pagination.filters.activityAreaId as number | undefined,
    neighborhoodId: pagination.filters.neighborhoodId as number | undefined,
    active: pagination.filters.active as boolean | undefined,
  };

  // ─── Initial bootstrap ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        // setLoading(true);
        // const [{ data: scenariosData }, areas, neighs] = await Promise.all([
        //   scenarioService.getAll({ limit: 100 }),
        //   activityAreaService.getAll(),
        //   neighborhoodService.getAll(),
        // ]);

        // setScenarios(scenariosData);
        // setActivityAreas(Array.isArray(areas) ? areas : areas.data);
        // setNeighborhoods(Array.isArray(neighs) ? neighs : neighs.data);
        // setSurface([
        //   { id: 1, name: "Concreto" },
        //   { id: 2, name: "Sintético" },
        //   { id: 3, name: "Césped" },
        //   { id: 4, name: "Cemento" },
        // ]);
      } catch (err) {
        console.error(err);
        setError("Error al cargar datos iniciales.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ─── CRUD actions ───────────────────────────────────────────────────────────
  const createSubScenario = async (formData: Omit<SubScenario, "id"> & { images?: any[] }) => {
    setLoading(true);
    try {
      // Crear el DTO con solo los campos necesarios y validar tipos
      const createDto: Omit<SubScenario, "id"> = {
        name: formData.name,
        active: Boolean(formData.active),
        hasCost: Boolean(formData.hasCost),
        numberOfSpectators: Number(formData.numberOfSpectators) || 0,
        numberOfPlayers: Number(formData.numberOfPlayers) || 0,
        recommendations: formData.recommendations || "",
        scenarioId: Number(formData.scenarioId),
        activityAreaId: formData.activityAreaId
          ? Number(formData.activityAreaId)
          : undefined,
        fieldSurfaceTypeId: formData.fieldSurfaceTypeId
          ? Number(formData.fieldSurfaceTypeId)
          : undefined,
      };

      createSubScenarioAction(createDto);
    } catch (error) {
      console.error("Error al crear subescenario:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSubScenario = async (id: number, formData: Partial<SubScenario>) => {
    setLoading(true);
    try {
      // Filtrar solo los campos editables para el DTO de actualización
      const updateDto: UpdateSubScenarioDto = {
        name: formData.name,
        active: formData.active,
        hasCost: formData.hasCost,
        numberOfSpectators: formData.numberOfSpectators,
        numberOfPlayers: formData.numberOfPlayers,
        recommendations: formData.recommendations,
        activityAreaId: formData.activityAreaId,
        fieldSurfaceTypeId: formData.fieldSurfaceTypeId,
      };

      // TODO: Call update action
    } finally {
      setLoading(false);
    }
  };

  const toggleSubScenarioStatus = async (subScenario: SubScenario, onSuccess?: () => void, onError?: (error: string) => void) => {
    const command = SubScenarioCommandFactory.toggleSubScenarioStatus(subScenario, {
      onSuccess: (updatedSubScenario) => {
        // Execute callback provided
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Toggle status error:", error);
        onError?.(error);
      },
    });

    return await command.execute();
  }

  return {
    // Pagination from standardized hook
    ...pagination,

    // Domain-specific state
    filters,
    subScenarios,
    scenarios,
    activityAreas,
    neighborhoods,
    fieldSurfaceTypes,
    pageMeta,
    loading,
    error,

    // CRUD actions
    createSubScenario,
    updateSubScenario,
    toggleSubScenarioStatus,
  };
}

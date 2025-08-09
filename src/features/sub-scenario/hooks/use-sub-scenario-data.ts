"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";

import {
  ActivityArea,
  Neighborhood,
  Scenario,
  SubScenario,
  CreateSubScenarioDto,
  UpdateSubScenarioDto,
  activityAreaService,
  neighborhoodService,
  scenarioService,
  subScenarioService,
} from "@/services/api";
import {
  useDashboardPagination,
  PageMeta,
} from "@/shared/hooks/use-dashboard-pagination";
import { SubScenarioCommandFactory } from "@/features/dashboard/sub-scenarios/commands/sub-scenario-commands";

export interface ISubScenarioFilters {
  search: string;
  scenarioId?: number;
  activityAreaId?: number;
  neighborhoodId?: number;
  active?: boolean;
}

export function useSubScenarioData() {
  const initialRender = useRef(true);

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
        setLoading(true);
        const [{ data: scenariosData }, areas, neighs] = await Promise.all([
          scenarioService.getAll({ limit: 100 }),
          activityAreaService.getAll(),
          neighborhoodService.getAll(),
        ]);

        setScenarios(scenariosData);
        setActivityAreas(Array.isArray(areas) ? areas : areas.data);
        setNeighborhoods(Array.isArray(neighs) ? neighs : neighs.data);
        setSurface([
          { id: 1, name: "Concreto" },
          { id: 2, name: "Sintético" },
          { id: 3, name: "Césped" },
          { id: 4, name: "Cemento" },
        ]);
      } catch (err) {
        console.error(err);
        setError("Error al cargar datos iniciales.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ─── Memoize query params to avoid infinite loops ─────────────────────────────────────────────
  const queryParams = useMemo(
    () => ({
      page: pagination.filters.page,
      limit: pagination.filters.limit,
      search: pagination.filters.search,
      scenarioId: filters.scenarioId,
      activityAreaId: filters.activityAreaId,
      neighborhoodId: filters.neighborhoodId,
      active: filters.active,
    }),
    [
      pagination.filters.page,
      pagination.filters.limit,
      pagination.filters.search,
      filters.scenarioId,
      filters.activityAreaId,
      filters.neighborhoodId,
      filters.active,
    ]
  );

  // ─── Fetch subescenarios cuando cambian los filtros ───────────────────────────────────────────
  const fetchSubScenarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subScenarioService.getAll(queryParams);
      console.log("Sub-escenarios obtenidos:", res.data);
      setSubScenarios(res.data);
      const meta = pagination.buildPageMeta(res.meta.totalItems);
      setPageMeta(meta);
    } catch (err) {
      console.error(err);
      setError("Error al obtener sub-escenarios.");
    } finally {
      setLoading(false);
    }
  }, [queryParams, pagination.buildPageMeta]);

  // ─── Effect para fetch cuando cambian los filtros ─────────────────────────────────────────────
  useEffect(() => {
    // Evitar fetch en el primer render si ya hay datos (SSR)
    if (initialRender.current) {
      initialRender.current = false;
      if (subScenarios.length === 0) {
        fetchSubScenarios();
      }
      return;
    }

    fetchSubScenarios();
  }, [fetchSubScenarios]);

  // ─── CRUD actions ───────────────────────────────────────────────────────────
  const createSubScenario = useCallback(
    async (formData: Omit<SubScenario, "id"> & { images?: any[] }) => {
      setLoading(true);
      try {
        // Crear el DTO con solo los campos necesarios y validar tipos
        const createDto: CreateSubScenarioDto = {
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

        // Extraer archivos File de las imágenes
        const imageFiles: File[] =
          formData.images?.map((img) => img.url).filter(Boolean) || [];

        // Crear subescenario con imágenes en una sola llamada
        await subScenarioService.create(createDto, imageFiles);

        // Refetch los datos actuales
        await fetchSubScenarios();
      } catch (error) {
        console.error("Error al crear subescenario:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchSubScenarios]
  );

  const updateSubScenario = useCallback(
    async (id: number, formData: Partial<SubScenario>) => {
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

        // Remover campos undefined para evitar enviarlos
        const cleanDto = Object.fromEntries(
          Object.entries(updateDto).filter(([_, value]) => value !== undefined)
        ) as UpdateSubScenarioDto;

        await subScenarioService.update(id, cleanDto);
        // Refetch los datos actuales
        await fetchSubScenarios();
      } finally {
        setLoading(false);
      }
    },
    [fetchSubScenarios]
  );

  const toggleSubScenarioStatus = useCallback(
    async (subScenario: SubScenario, onSuccess?: () => void, onError?: (error: string) => void) => {
      const command = SubScenarioCommandFactory.toggleSubScenarioStatus(subScenario, {
        onSuccess: (updatedSubScenario) => {
          // Refetch los datos actuales
          fetchSubScenarios();
          onSuccess?.();
        },
        onError: (error) => {
          console.error("Toggle status error:", error);
          onError?.(error);
        },
      });

      return await command.execute();
    },
    [fetchSubScenarios]
  );

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

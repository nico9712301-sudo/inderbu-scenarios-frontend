"use client";

import {
  SubScenario,
  UpdateSubScenarioDto,
} from "@/services/api";
import {
  useDashboardPagination,
} from "@/shared/hooks/use-dashboard-pagination";
import { createSubScenarioAction } from "@/presentation/features/dashboard/sub-scenarios/actions/sub-scenario.actions";
import { ISubScenariosDataResponse } from "@/presentation/features/dashboard/sub-scenarios/application/GetSubScenariosDataUseCase";

export function useSubScenarioData(initialData: ISubScenariosDataResponse) {

  // ─── Use standardized pagination hook ─────────────────────────────────────────────────────────────
  const pagination = useDashboardPagination({
    baseUrl: "/dashboard/sub-scenarios",
    defaultLimit: 7,
  });

  // EXPERIMENTO: Comentar temporalmente los logs para probar la hipótesis
  // console.log("Initial data in useSubScenarioData:", initialData);
  // console.log("initialData type:", typeof initialData);
  // console.log("initialData is undefined:", initialData === undefined);
  
  // EXPERIMENTO: Comentar temporalmente el fallback para probar si funciona sin él
  // const defaultData: ISubScenariosDataResponse = {
  //   subScenarios: [],
  //   scenarios: [],
  //   activityAreas: [],
  //   neighborhoods: [],
  //   fieldSurfaceTypes: [],
  //   meta: { 
  //     page: 1, 
  //     limit: 7, 
  //     totalItems: 0, 
  //     totalPages: 0, 
  //     hasNextPage: false, 
  //     hasPreviousPage: false 
  //   },
  //   filters: { page: 1, limit: 7, search: "" }
  // };
  
  // const safeData = initialData || defaultData;
  
  // ─── CRUD actions ───────────────────────────────────────────────────────────
  // const createSubScenario = async (formData: Omit<SubScenario, "id"> & { images?: any[] }) => {
  //   setLoading(true);
  //   try {
  //     // Crear el DTO con solo los campos necesarios y validar tipos
  //     const createDto: Omit<SubScenario, "id"> = {
  //       name: formData.name,
  //       active: Boolean(formData.active),
  //       hasCost: Boolean(formData.hasCost),
  //       numberOfSpectators: Number(formData.numberOfSpectators) || 0,
  //       numberOfPlayers: Number(formData.numberOfPlayers) || 0,
  //       recommendations: formData.recommendations || "",
  //       scenarioId: Number(formData.scenarioId),
  //       activityAreaId: formData.activityAreaId
  //         ? Number(formData.activityAreaId)
  //         : undefined,
  //       fieldSurfaceTypeId: formData.fieldSurfaceTypeId
  //         ? Number(formData.fieldSurfaceTypeId)
  //         : undefined,
  //     };

  //     createSubScenarioAction(createDto);
  //   } catch (error) {
  //     console.error("Error al crear subescenario:", error);
  //     throw error;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const updateSubScenario = async (id: number, formData: Partial<SubScenario>) => {
  //   setLoading(true);
  //   try {
  //     // Filtrar solo los campos editables para el DTO de actualización
  //     const updateDto: UpdateSubScenarioDto = {
  //       name: formData.name,
  //       active: formData.active,
  //       hasCost: formData.hasCost,
  //       numberOfSpectators: formData.numberOfSpectators,
  //       numberOfPlayers: formData.numberOfPlayers,
  //       recommendations: formData.recommendations,
  //       activityAreaId: formData.activityAreaId,
  //       fieldSurfaceTypeId: formData.fieldSurfaceTypeId,
  //     };

  //     // TODO: Call update action
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return {
    // Pagination from standardized hook
    ...pagination,

    // Domain-specific state
    subScenarios: initialData.subScenarios,
    scenarios: initialData.scenarios,
    activityAreas: initialData.activityAreas,
    neighborhoods: initialData.neighborhoods,
    fieldSurfaceTypes: initialData.fieldSurfaceTypes,
    pageMeta: initialData.meta,

    // CRUD actions
    // createSubScenario,
    // updateSubScenario,
  };
}

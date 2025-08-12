"use client";

import {
  useDashboardPagination,
} from "@/shared/hooks/use-dashboard-pagination";
import { ISubScenariosDataResponse } from "@/presentation/features/dashboard/sub-scenarios/application/GetSubScenariosDataUseCase";

export function useSubScenarioData(initialData: ISubScenariosDataResponse) {

  // ─── Use standardized pagination hook ─────────────────────────────────────────────────────────────
  const pagination = useDashboardPagination({
    baseUrl: "/dashboard/sub-scenarios",
    defaultLimit: 7,
  });

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
  };
}

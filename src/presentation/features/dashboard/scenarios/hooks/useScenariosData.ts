"use client";

import { useDashboardPagination } from "@/shared/hooks/use-dashboard-pagination";
import { IScenariosDataClientResponse } from "@/presentation/utils/serialization.utils";

export function useScenariosData(initialData: IScenariosDataClientResponse) {

  const pagination = useDashboardPagination({
    baseUrl: "/dashboard/scenarios",
    defaultLimit: 7,
  });

  console.log("Initial data in useScenariosData:", initialData);
  console.log("initialData type:", typeof initialData);
  console.log("initialData is undefined:", initialData === undefined);
  
  return {
    ...pagination,
    scenarios: initialData.scenarios,
    neighborhoods: initialData.neighborhoods,
    meta: initialData.meta,
  };
}

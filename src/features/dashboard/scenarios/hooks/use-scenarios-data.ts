"use client";

import { useDashboardPagination } from "@/shared/hooks/use-dashboard-pagination";
import { IScenariosDataResponse } from "../application/GetScenariosDataUseCase";
import { useState } from "react";

export function useScenariosData(initialData: IScenariosDataResponse) {

  const pagination = useDashboardPagination({
    baseUrl: "/dashboard/scenarios",
    defaultLimit: 7,
  });

  return {
    ...pagination,
    scenarios: initialData.scenarios,
    neighborhoods: initialData.neighborhoods,
    meta: initialData.meta,
  };
}

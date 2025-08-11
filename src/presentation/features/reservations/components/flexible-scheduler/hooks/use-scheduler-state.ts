import { useState } from "react";
import { ScheduleConfig } from "../types/scheduler.types";
import { TIME_PERIODS } from "../constants/time-periods";

export const useSchedulerState = () => {
  const [config, setConfig] = useState<ScheduleConfig>({
    weekdays: [],
    timeSlots: [],
    hasDateRange: false,
    hasWeekdaySelection: false,
    startDate: new Date().toISOString().split("T")[0],
  });
  
  const [expandedPeriods, setExpandedPeriods] = useState<Record<string, boolean>>(
    TIME_PERIODS.reduce((acc, period) => ({
      ...acc,
      [period.id]: period.defaultExpanded
    }), {})
  );

  const togglePeriodExpansion = (periodId: string) => {
    setExpandedPeriods(prev => ({
      ...prev,
      [periodId]: !prev[periodId]
    }));
  };

  return {
    config,
    setConfig,
    expandedPeriods,
    togglePeriodExpansion,
  };
};

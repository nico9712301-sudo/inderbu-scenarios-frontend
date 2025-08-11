import { IFromTo, ScheduleConfig } from "../types/scheduler.types";
import { validateDateRange } from "../utils/date-helpers";
import { useState } from "react";
import { toast } from "sonner";

export const useDateConfiguration = (
  config: ScheduleConfig,
  setConfig: (updateFn: (prev: ScheduleConfig) => ScheduleConfig) => void
) => {
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<IFromTo>(() => ({
    from: new Date().toISOString().split("T")[0],
    to: undefined,
  }));

  const handleWeekdayToggle = (weekday: number) => {
    const newWeekdays = selectedWeekdays.includes(weekday)
      ? selectedWeekdays.filter((w) => w !== weekday)
      : [...selectedWeekdays, weekday];

    setSelectedWeekdays(newWeekdays);
    setConfig((prev) => ({ ...prev, weekdays: newWeekdays }));
  };

  const handleDateRangeToggle = (checked: boolean) => {
    setConfig((prev) => ({ ...prev, hasDateRange: checked }));
    if (!checked) {
      setDateRange((prev) => ({ ...prev, to: undefined }));
      setConfig((prev) => ({ ...prev, endDate: undefined }));
    }
  };

  const handleWeekdaySelectionToggle = (checked: boolean) => {
    setConfig((prev) => ({ ...prev, hasWeekdaySelection: checked }));
    if (!checked) {
      setSelectedWeekdays([]);
      setConfig((prev) => ({ ...prev, weekdays: [] }));
    }
  };

  const handleStartDateChange = (dateStr: string) => {
    setDateRange((prev) => {
      const newRange = { ...prev, from: dateStr };
      
      // Si hay fecha final y ahora es inválida, limpiarla
      if (prev.to && !validateDateRange(dateStr, prev.to)) {
        newRange.to = undefined;
        // También limpiar del config
        setConfig((prevConfig) => ({ ...prevConfig, endDate: undefined }));
        
        // Notificar al usuario sobre el cambio
        toast.info("Fecha final actualizada", {
          description: "La fecha final fue ajustada automáticamente",
          duration: 3000,
        });
      }
      
      return newRange;
    });
    setConfig((prev) => ({ ...prev, startDate: dateStr }));
  };

  const handleEndDateChange = (dateStr: string) => {
    if (dateRange.from && !validateDateRange(dateRange.from, dateStr)) {
      return;
    }
    setDateRange((prev) => ({ ...prev, to: dateStr }));
    setConfig((prev) => ({ ...prev, endDate: dateStr }));
  };

  return {
    selectedWeekdays,
    dateRange,
    handleWeekdayToggle,
    handleDateRangeToggle,
    handleWeekdaySelectionToggle,
    handleStartDateChange,
    handleEndDateChange,
  };
};

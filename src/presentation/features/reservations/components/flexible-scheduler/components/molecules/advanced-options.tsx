import { Info } from "lucide-react";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { Tooltip } from "@/shared/components/atoms/tooltip";
import { WeekdaySelector } from "../atoms/weekday-selector";
import { AdvancedOptionsProps } from "../../types/scheduler.types";

export const AdvancedOptions = ({
  config,
  selectedWeekdays,
  onDateRangeToggle,
  onWeekdaySelectionToggle,
  onWeekdayToggle,
}: AdvancedOptionsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="date-range-mode"
          checked={config.hasDateRange}
          onCheckedChange={onDateRangeToggle}
        />
        <Label htmlFor="date-range-mode" className="text-base font-medium">
          Reservar varios días
        </Label>
        <Tooltip content="Activa esta opción si quieres reservar el mismo horario para múltiples días" side="top">
          <Info className="h-4 w-4 text-gray-400 cursor-help" />
        </Tooltip>
      </div>

      {config.hasDateRange && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Switch
              id="weekday-selection-mode"
              checked={config.hasWeekdaySelection}
              onCheckedChange={onWeekdaySelectionToggle}
            />
            <Label htmlFor="weekday-selection-mode" className="text-base font-medium">
              Seleccionar días específicos de la semana
            </Label>
            <Tooltip content="Si activas esta opción, solo se reservarán los días de la semana que selecciones" side="top">
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
            </Tooltip>
          </div>

          {config.hasWeekdaySelection && (
            <WeekdaySelector
              selectedWeekdays={selectedWeekdays}
              onWeekdayToggle={onWeekdayToggle}
            />
          )}
        </div>
      )}
    </div>
  );
};

import { TimePeriodGroup } from "../molecules/time-period-group";
import { TIME_PERIODS } from "../../constants/time-periods";
import { TimeSlot } from "../../types/scheduler.types";
import { FiLoader } from "react-icons/fi";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";

interface TimeSelectionGridProps {
  timeSlots: TimeSlot[];
  selectedSlots: Set<number>;
  availableSlotIds: number[];
  expandedPeriods: Record<string, boolean>;
  isLoading: boolean;
  onSlotToggle: (hour: number) => void;
  onPeriodSelect: (periodId: string) => void;
  onToggleExpand: (periodId: string) => void;
  onApplyShortcut: (shortcutId: string) => void;
}

export const TimeSelectionGrid = ({
  timeSlots,
  selectedSlots,
  availableSlotIds,
  expandedPeriods,
  isLoading,
  onSlotToggle,
  onPeriodSelect,
  onToggleExpand,
  onApplyShortcut,
}: TimeSelectionGridProps) => {
  const selectedCount = selectedSlots.size;

  if (isLoading) {
    return (
      <div className="text-center py-4 animate-pulse">
        <FiLoader className="h-6 w-6 animate-spin mx-auto text-blue-500 mb-2" />
        <p className="text-sm text-blue-600">Consultando disponibilidad...</p>
      </div>
    );
  }

  if (!isLoading && availableSlotIds.length === 0) {
    return (
      <div className="text-center py-6 animate-in fade-in duration-500">
        <div className="text-6xl mb-4">😔</div>
        <p className="text-sm text-red-600 font-medium">
          No hay horarios disponibles para esta fecha
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Intenta con otra fecha
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Label className="text-lg font-semibold">Elige tus horarios</Label>
          <Badge variant="outline" className="text-sm">
            {availableSlotIds.length} disponibles
          </Badge>
        </div>
      </div>

      {/* <SmartShortcutsGrid
        shortcuts={SMART_SHORTCUTS}
        onApplyShortcut={onApplyShortcut}
        isLoading={isLoading}
      /> */}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {TIME_PERIODS.map((period) => (
          <TimePeriodGroup
            key={period.id}
            period={period}
            timeSlots={timeSlots}
            selectedSlots={selectedSlots}
            isExpanded={expandedPeriods[period.id]}
            isLoading={isLoading}
            onSlotToggle={onSlotToggle}
            onPeriodSelect={onPeriodSelect}
            onToggleExpand={onToggleExpand}
          />
        ))}
      </div>

      {!isLoading && selectedCount === 0 && availableSlotIds.length > 0 && (
        <div className="text-center py-2">
          <p className="text-sm text-gray-500">
            Selecciona un horario disponible para continuar
          </p>
        </div>
      )}
    </div>
  );
};

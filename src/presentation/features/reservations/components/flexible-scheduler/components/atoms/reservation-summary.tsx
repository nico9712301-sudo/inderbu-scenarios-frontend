import { Star } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
import { formatDateSafe } from "../../utils/date-helpers";
import { formatHourHuman } from "../../utils/time-formatters";
import { WEEKDAYS } from "../../constants/weekdays";
import { ReservationSummaryProps } from "../../types/scheduler.types";

export const ReservationSummary = ({
  dateRange,
  selectedSlots,
  selectedWeekdays,
  config,
}: ReservationSummaryProps) => {
  if (!dateRange.from || selectedSlots.size === 0) return null;

  const getReservationText = () => {
    if (!config.hasDateRange) {
      return `${formatDateSafe(dateRange.from)} • ${selectedSlots.size} horario${selectedSlots.size > 1 ? 's' : ''}`;
    }
    
    if (config.hasWeekdaySelection && selectedWeekdays.length > 0) {
      const weekdayNames = selectedWeekdays.map((w) => 
        WEEKDAYS.find((wd) => wd.value === w)?.label
      ).join(", ");
      return `${formatDateSafe(dateRange.from)}${dateRange.to ? ` - ${formatDateSafe(dateRange.to)}` : ""} • ${weekdayNames} • ${selectedSlots.size} horario${selectedSlots.size > 1 ? 's' : ''}`;
    }
    
    return `${formatDateSafe(dateRange.from)}${dateRange.to ? ` - ${formatDateSafe(dateRange.to)}` : ""} • ${selectedSlots.size} horario${selectedSlots.size > 1 ? 's' : ''}`;
  };

  return (
    <div className="p-6 border-2 border-primary-200 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center gap-2 mb-4">
        <Star className="h-6 w-6 text-primary-600" />
        <Label className="font-bold text-primary-800 text-lg">
          ¡Tu reserva está casi lista!
        </Label>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-primary-700 mb-2">
            <strong>Resumen:</strong> {getReservationText()}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {Array.from(selectedSlots).sort((a, b) => a - b).map((hour) => (
            <Badge
              key={hour}
              variant="secondary"
              className="text-xs bg-primary-100 text-primary-700 border-primary-300 animate-in zoom-in duration-300"
            >
              {formatHourHuman(hour)}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
import { formatDateSafe } from "../../utils/date-helpers";
import { WEEKDAYS } from "../../constants/weekdays";
import { ReservationSummaryProps } from "../../types/scheduler.types";

export const ReservationSummary = ({
  dateRange,
  selectedSlots,
  selectedWeekdays,
  config,
  timeSlots,
}: ReservationSummaryProps) => {
  if (!dateRange.from || selectedSlots.size === 0) return null;

  // Obtener los timeSlots seleccionados con sus franjas completas
  const selectedTimeSlotsData = Array.from(selectedSlots)
    .map(slotId => timeSlots.find(slot => slot.hour === slotId))
    .filter(Boolean)
    .sort((a, b) => a!.hour - b!.hour);

  const getDateText = () => {
    if (!config.hasDateRange) {
      return formatDateSafe(dateRange.from);
    }

    if (config.hasWeekdaySelection && selectedWeekdays.length > 0) {
      const weekdayNames = selectedWeekdays.map((w) =>
        WEEKDAYS.find((wd) => wd.value === w)?.short
      ).join(", ");
      return `${formatDateSafe(dateRange.from)}${dateRange.to ? ` - ${formatDateSafe(dateRange.to)}` : ""} • ${weekdayNames}`;
    }

    return `${formatDateSafe(dateRange.from)}${dateRange.to ? ` - ${formatDateSafe(dateRange.to)}` : ""}`;
  };

  return (
    <div className="p-4 border border-green-200 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center gap-2 mb-3">
        <Label className="font-semibold text-green-800 text-base">
          ¡Tu reserva está casi lista!
        </Label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-green-700">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">{getDateText()}</span>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {selectedSlots.size} horario{selectedSlots.size > 1 ? 's' : ''} seleccionado{selectedSlots.size > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedTimeSlotsData.map((slot) => (
              <Badge
                key={slot!.hour}
                variant="secondary"
                className="text-xs bg-green-100 text-green-800 border-green-300 px-2 py-1 font-medium hover:bg-green-200 transition-colors"
              >
                {slot!.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

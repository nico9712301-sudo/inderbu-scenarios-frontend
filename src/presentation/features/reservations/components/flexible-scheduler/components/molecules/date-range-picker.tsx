import { formatDateSafe, getTodayISO, getNextDay } from "../../utils/date-helpers";
import { SimpleCalendar } from "@/shared/components/organisms/simple-calendar";
import { DateRangePickerProps } from "../../types/scheduler.types";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";

export const DateRangePicker = ({
  dateRange,
  hasDateRange,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) => {
  if (!hasDateRange) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label className="text-lg font-semibold">
            ¿Cuándo quieres reservar?
          </Label>
          {dateRange.from && (
            <Badge variant="secondary" className="bg-primary-100 text-primary-700">
              {formatDateSafe(dateRange.from)}
            </Badge>
          )}
        </div>
        <SimpleCalendar
          selectedDate={dateRange.from || getTodayISO()}
          onDateChange={onStartDateChange}
        />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label className="text-lg font-semibold">
            Fecha de inicio
          </Label>
          {dateRange.from && (
            <Badge variant="secondary" className="bg-primary-100 text-primary-700">
              {formatDateSafe(dateRange.from)}
            </Badge>
          )}
        </div>
        <SimpleCalendar
          selectedDate={dateRange.from || getTodayISO()}
          onDateChange={onStartDateChange}
        />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label className="text-lg font-semibold">
            Fecha de finalización
          </Label>
          {!dateRange.from && (
            <Badge variant="outline" className="bg-muted text-muted-foreground border-muted">
              Selecciona fecha de inicio primero
            </Badge>
          )}
          {dateRange.from && dateRange.to && (
            <Badge variant="secondary" className="bg-secondary-100 text-secondary-700">
              {formatDateSafe(dateRange.to)}
            </Badge>
          )}
        </div>
        <SimpleCalendar
          selectedDate={dateRange.to || (dateRange.from ? getNextDay(dateRange.from) : getTodayISO())}
          onDateChange={onEndDateChange}
          minDate={dateRange.from} // No permitir fechas <= fecha inicial
        />
      </div>
    </div>
  );
};

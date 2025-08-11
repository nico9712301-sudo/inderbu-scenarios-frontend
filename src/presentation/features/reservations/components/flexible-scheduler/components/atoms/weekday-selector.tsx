import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Label } from "@/shared/ui/label";
import { WEEKDAYS } from "../../constants/weekdays";
import { WeekdaySelectorProps } from "../../types/scheduler.types";

export const WeekdaySelector = ({ selectedWeekdays, onWeekdayToggle }: WeekdaySelectorProps) => {
  return (
    <div>
      <Label className="text-base font-medium">Días de la semana</Label>
      <div className="grid grid-cols-7 gap-2 mt-3">
        {WEEKDAYS.map((weekday) => (
          <Button
            key={weekday.value}
            variant={selectedWeekdays.includes(weekday.value) ? "secondary" : "outline"}
            size="sm"
            className={`h-12 flex flex-col transition-all duration-200 hover:scale-105 ${
              selectedWeekdays.includes(weekday.value)
                ? "bg-blue-100 text-blue-700 border-blue-300"
                : "hover:bg-muted"
            }`}
            onClick={() => onWeekdayToggle(weekday.value)}
          >
            <span className="text-xs">{weekday.short}</span>
            <span className="text-xs">{weekday.label.slice(0, 3)}</span>
          </Button>
        ))}
      </div>

      {selectedWeekdays.length > 0 && (
        <div className="mt-3">
          <Label>Días seleccionados:</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedWeekdays.map((weekday) => (
              <Badge key={weekday} variant="secondary" className="bg-blue-100 text-blue-700 animate-in zoom-in duration-300">
                {WEEKDAYS.find((w) => w.value === weekday)?.label}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

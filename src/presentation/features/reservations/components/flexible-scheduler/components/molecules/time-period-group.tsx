import { PeriodHeader } from "../atoms/period-header";
import { TimeSlotButton } from "../atoms/time-slot-button";
import { TimePeriodGroupProps } from "../../types/scheduler.types";

export const TimePeriodGroup = ({
  period,
  timeSlots,
  selectedSlots,
  isExpanded,
  isLoading,
  onSlotToggle,
  onPeriodSelect,
  onToggleExpand,
}: TimePeriodGroupProps) => {
  const periodSlots = timeSlots.filter(slot => period.hours.includes(slot.hour));
  const availableInPeriod = periodSlots.filter(slot => slot.status === 'available').length;
  const selectedInPeriod = periodSlots.filter(slot => selectedSlots.has(slot.hour)).length;

  return (
    <div className={`border rounded-lg ${period.color} transition-all duration-300 hover:shadow-md`}>
      <PeriodHeader
        period={period}
        selectedCount={selectedInPeriod}
        availableCount={availableInPeriod}
        isExpanded={isExpanded}
        onSelectAll={() => onPeriodSelect(period.id)}
        onToggleExpand={() => onToggleExpand(period.id)}
      />

      <div className={`overflow-hidden transition-all duration-300 ${
        isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="p-3 pt-0 grid grid-cols-2 gap-2">
          {periodSlots.map((slot) => (
            <TimeSlotButton
              key={slot.hour}
              slot={slot}
              isSelected={selectedSlots.has(slot.hour)}
              isLoading={isLoading}
              onToggle={onSlotToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

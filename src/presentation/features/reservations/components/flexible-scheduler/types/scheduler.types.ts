export interface TimeSlot {
  hour: number;
  label: string;
  selected: boolean;
  status: 'available' | 'occupied' | 'unknown';
}

export interface TimePeriod {
  id: string;
  name: string;
  icon: any;
  description: string;
  hours: number[];
  color: string;
  shortcut: string;
  defaultExpanded: boolean;
}

export interface SmartShortcut {
  id: string;
  name: string;
  description: string;
  hours: number[];
  icon: string;
}

export interface Weekday {
  value: number;
  label: string;
  short: string;
}

export interface ScheduleConfig {
  startDate?: string;
  endDate?: string;
  hasDateRange: boolean;
  hasWeekdaySelection: boolean;
  weekdays: number[];
  timeSlots: number[];
}

export interface IFromTo {
  from: string | undefined;
  to: string | undefined;
}

export interface FlexibleSchedulerProps {
  subScenarioId: number;
}

// URL Persistence types
export interface URLSchedulerState {
  date?: string;        // initialDate (YYYY-MM-DD)
  endDate?: string;     // finalDate (YYYY-MM-DD)
  weekdays?: string;    // "1,2,3,4,5" comma-separated
  mode?: 'single' | 'range';
}

export interface TimeSlotButtonProps {
  slot: TimeSlot;
  isSelected: boolean;
  isLoading: boolean;
  onToggle: (hour: number) => void;
}

export interface PeriodHeaderProps {
  period: TimePeriod;
  selectedCount: number;
  availableCount: number;
  isExpanded: boolean;
  onSelectAll: () => void;
  onToggleExpand: () => void;
}

export interface TimePeriodGroupProps {
  period: TimePeriod;
  timeSlots: TimeSlot[];
  selectedSlots: Set<number>;
  isExpanded: boolean;
  isLoading: boolean;
  onSlotToggle: (hour: number) => void;
  onPeriodSelect: (periodId: string) => void;
  onToggleExpand: (periodId: string) => void;
}

export interface SmartShortcutsGridProps {
  shortcuts: SmartShortcut[];
  onApplyShortcut: (shortcutId: string) => void;
  isLoading: boolean;
}

export interface DateRangePickerProps {
  dateRange: IFromTo;
  hasDateRange: boolean;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export interface AdvancedOptionsProps {
  config: ScheduleConfig;
  selectedWeekdays: number[];
  onDateRangeToggle: (checked: boolean) => void;
  onWeekdaySelectionToggle: (checked: boolean) => void;
  onWeekdayToggle: (weekday: number) => void;
}

export interface ConfirmationSectionProps {
  dateRange: IFromTo;
  selectedSlots: Set<number>;
  selectedWeekdays: number[];
  config: ScheduleConfig;
  isSubmitting: boolean;
  isLoading: boolean;
  onSubmit: () => void;
  onClear: () => void;
}

export interface ReservationSummaryProps {
  dateRange: IFromTo;
  selectedSlots: Set<number>;
  selectedWeekdays: number[];
  config: ScheduleConfig;
}

export interface WeekdaySelectorProps {
  selectedWeekdays: number[];
  onWeekdayToggle: (weekday: number) => void;
}

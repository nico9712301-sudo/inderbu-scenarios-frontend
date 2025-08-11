// Main component
export { default as FlexibleScheduler } from "./components/organisms/flexible-scheduler";

// Hooks
export { useSchedulerState } from "./hooks/use-scheduler-state";
export { useDateConfiguration } from "./hooks/use-date-configuration";
export { useTimeSlotSelection } from "./hooks/use-time-slot-selection";
export { useReservationProcess } from "./hooks/use-reservation-process";
export { useURLPersistence } from "./hooks/use-url-persistence";

// Constants
export { TIME_PERIODS } from "./constants/time-periods";
export { SMART_SHORTCUTS } from "./constants/smart-shortcuts";
export { WEEKDAYS } from "./constants/weekdays";

// Utils
export { formatHourHuman, generateTimeSlots, getAvailableSlotsInPeriod } from "./utils/time-formatters";
export { validateSlotAvailability, getUnavailableSlots, validateMinimumSelection, validateDateSelection } from "./utils/slot-validators";
export { getTodayISO, formatDateSafe, validateDateRange } from "./utils/date-helpers";

// Types
export type * from "./types/scheduler.types";

// Components
export { TimeSlotButton } from "./components/atoms/time-slot-button";
export { PeriodHeader } from "./components/atoms/period-header";
export { ShortcutButton } from "./components/atoms/shortcut-button";
export { WeekdaySelector } from "./components/atoms/weekday-selector";
export { ReservationSummary } from "./components/atoms/reservation-summary";

export { TimePeriodGroup } from "./components/molecules/time-period-group";
export { SmartShortcutsGrid } from "./components/molecules/smart-shortcuts-grid";
export { DateRangePicker } from "./components/molecules/date-range-picker";
export { AdvancedOptions } from "./components/molecules/advanced-options";
export { ConfirmationSection } from "./components/molecules/confirmation-section";

export { TimeSelectionGrid } from "./components/organisms/time-selection-grid";

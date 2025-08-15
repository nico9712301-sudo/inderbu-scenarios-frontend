import { useAvailabilityConfiguration } from "@/presentation/features/reservations/hooks/use-availability-configuration.hook";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { FlexibleSchedulerProps, ScheduleConfig, IFromTo } from "../../types/scheduler.types";
import { AuthModal } from "@/presentation/features/auth/components/organisms/auth-modal";
import { useReservationProcess } from "../../hooks/use-reservation-process";
import { useTimeSlotSelection } from "../../hooks/use-time-slot-selection";
import { useDateConfiguration } from "../../hooks/use-date-configuration";
import { ConfirmationSection } from "../molecules/confirmation-section";
import { CalendarIcon, HelpCircle, AlertTriangle } from "lucide-react";
import { TimeSelectionGrid } from "../organisms/time-selection-grid";
import { useSchedulerState } from "../../hooks/use-scheduler-state";
import { useURLPersistence } from "../../hooks/use-url-persistence";
import { DateRangePicker } from "../molecules/date-range-picker";
import { AdvancedOptions } from "../molecules/advanced-options";
import { generateTimeSlots } from "../../utils/time-formatters";
import { Button } from "@/shared/ui/button";
import { useMemo, useEffect } from "react";
import { FiLoader } from "react-icons/fi";
import { Tooltip } from "@/shared/ui/tooltip";

export default function FlexibleScheduler({ subScenarioId }: FlexibleSchedulerProps) {
  // Hooks de estado
  const schedulerState = useSchedulerState();
  const {
    config,
    setConfig,
    expandedPeriods,
    togglePeriodExpansion,
  } = schedulerState;

  const dateConfig = useDateConfiguration(config, setConfig);
  const {
    selectedWeekdays,
    dateRange,
    handleWeekdayToggle,
    handleDateRangeToggle,
    handleWeekdaySelectionToggle,
    handleStartDateChange,
    handleEndDateChange,
  } = dateConfig;

  // Hook único para disponibilidad
  const availabilityConfig = useMemo(() => ({
    subScenarioId,
    initialDate: dateRange.from || new Date().toISOString().split("T")[0],
    finalDate: config.hasDateRange ? dateRange.to : undefined,
    weekdays: config.hasWeekdaySelection && selectedWeekdays.length > 0 ? selectedWeekdays : undefined,
  }), [subScenarioId, dateRange.from, dateRange.to, config.hasDateRange, config.hasWeekdaySelection, selectedWeekdays]);

  const {
    availableSlotIds,
    isLoading: isLoadingAvailability,
    error: availabilityError,
    checkAvailability,
    checkSlotAvailability,
    getSlotStatus,
  } = useAvailabilityConfiguration();

  // Hook de selección de slots
  const slotSelection = useTimeSlotSelection(checkSlotAvailability, setConfig);
  const {
    selectedSlots,
    toggleTimeSlot,
    applySmartShortcut,
    selectPeriodHours,
    clearAllTimeSlots,
    removeUnavailableSlots,
  } = slotSelection;

  // Hook del proceso de reserva
  const {
    isSubmitting,
    isLoginModalOpen,
    setIsLoginModalOpen,
    onSubmit,
    handleLoginSuccess,
  } = useReservationProcess(
    subScenarioId,
    availabilityConfig,
    checkAvailability,
    checkSlotAvailability
  );

  // Callbacks para URL persistence
  const handleRestoreConfig = (restoredConfig: Partial<ScheduleConfig>) => {
    setConfig(prev => ({ ...prev, ...restoredConfig }));
  };

  const handleRestoreDateRange = (restoredRange: IFromTo) => {
    if (restoredRange.from) {
      handleStartDateChange(restoredRange.from);
    }
    if (restoredRange.to) {
      handleEndDateChange(restoredRange.to);
    }
  };

  const handleRestoreWeekdays = (weekdays: number[]) => {
    weekdays.forEach(weekday => {
      if (!selectedWeekdays.includes(weekday)) {
        handleWeekdayToggle(weekday);
      }
    });
  };

  // URL Persistence
  useURLPersistence(
    config,
    dateRange,
    selectedWeekdays,
    handleRestoreConfig,
    handleRestoreDateRange,
    handleRestoreWeekdays
  );

  // Auto-consultar cuando cambie la configuración
  useEffect(() => {
    console.log('🔍 Availability config changed:', availabilityConfig);
    checkAvailability(availabilityConfig);
  }, [availabilityConfig, checkAvailability]);

  // Generar timeSlots con estado de disponibilidad
  const timeSlots = useMemo(() => {
    return generateTimeSlots((hour) => getSlotStatus(hour));
  }, [getSlotStatus]);

  // Manejadores de eventos
  const handleSubmit = () => {
    const hadUnavailableSlots = removeUnavailableSlots();
    if (hadUnavailableSlots) return;

    onSubmit(selectedSlots, dateRange, selectedWeekdays, clearAllTimeSlots);
  };

  const handleLoginSuccessWrapper = () => {
    handleLoginSuccess(selectedSlots, dateRange, selectedWeekdays, clearAllTimeSlots);
  };

  return (
    <div className="w-full px-2 sm:px-4 lg:px-8 space-y-4 sm:space-y-6">
      <Card className="border-2 shadow-lg transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Reserva tu horario
            {isLoadingAvailability && (
              <FiLoader className="h-4 w-4 animate-spin text-blue-500" />
            )}
            
            {/* <Tooltip content="Selecciona una fecha y horarios para crear tu reserva. ¡Es súper fácil!" side="bottom"> */}
            <Tooltip>
              <Button variant="ghost" size="sm" className="ml-auto">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </Tooltip>
          </CardTitle>
          <CardDescription>
            {availabilityError && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                Error al cargar disponibilidad: {availabilityError}
              </div>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <AdvancedOptions
            config={config}
            selectedWeekdays={selectedWeekdays}
            onDateRangeToggle={handleDateRangeToggle}
            onWeekdaySelectionToggle={handleWeekdaySelectionToggle}
            onWeekdayToggle={handleWeekdayToggle}
          />

          <div className="grid lg:grid-cols-2 gap-6">
            <DateRangePicker
              dateRange={dateRange}
              hasDateRange={config.hasDateRange}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
            />

            <div className="transition-all duration-500 opacity-100">
              <TimeSelectionGrid
                timeSlots={timeSlots}
                selectedSlots={selectedSlots}
                availableSlotIds={availableSlotIds}
                expandedPeriods={expandedPeriods}
                isLoading={isLoadingAvailability}
                onSlotToggle={toggleTimeSlot}
                onPeriodSelect={selectPeriodHours}
                onToggleExpand={togglePeriodExpansion}
                onApplyShortcut={applySmartShortcut}
              />
            </div>
          </div>

          <ConfirmationSection
            dateRange={dateRange}
            selectedSlots={selectedSlots}
            selectedWeekdays={selectedWeekdays}
            config={config}
            isSubmitting={isSubmitting}
            isLoading={isLoadingAvailability}
            onSubmit={handleSubmit}
            onClear={clearAllTimeSlots}
          />
        </CardContent>
      </Card>

      <AuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccessWrapper}
      />
    </div>
  );
}

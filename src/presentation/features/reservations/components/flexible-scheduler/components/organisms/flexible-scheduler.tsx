import { useAvailabilityConfiguration } from "@/presentation/features/reservations/hooks/use-availability-configuration.hook";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { FlexibleSchedulerProps, ScheduleConfig, IFromTo } from "../../types/scheduler.types";
import { generateTimeSlots, convertBackendTimeSlotsToUI } from "../../utils/time-formatters";
import { AuthModal } from "@/presentation/features/auth/components/organisms/auth-modal";
import { useReservationProcess } from "../../hooks/use-reservation-process";
import { useTimeSlotSelection } from "../../hooks/use-time-slot-selection";
import { useDateConfiguration } from "../../hooks/use-date-configuration";
import { ConfirmationSection } from "../molecules/confirmation-section";
import { TimeSelectionGrid } from "../organisms/time-selection-grid";
import { useSchedulerState } from "../../hooks/use-scheduler-state";
import { useURLPersistence } from "../../hooks/use-url-persistence";
import { getTodayInColombia } from "../../utils/slot-validators";
import { DateRangePicker } from "../molecules/date-range-picker";
import { AdvancedOptions } from "../molecules/advanced-options";
import { CalendarIcon, AlertTriangle } from "lucide-react";
import { useMemo, useEffect } from "react";
import { FiLoader } from "react-icons/fi";

export default function FlexibleScheduler({
  subScenarioId,
  initialAvailabilityData
}: FlexibleSchedulerProps) {
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
    initialDate: dateRange.from || getTodayInColombia(),
    finalDate: config.hasDateRange ? dateRange.to : undefined,
    weekdays: config.hasWeekdaySelection && selectedWeekdays.length > 0 ? selectedWeekdays : undefined,
  }), [subScenarioId, dateRange.from, dateRange.to, config.hasDateRange, config.hasWeekdaySelection, selectedWeekdays]);

  // Convertir initialAvailabilityData al formato esperado por el hook si existe
  const initialDataFormatted = useMemo(() => {
    if (!initialAvailabilityData) return undefined;

    return {
      subScenarioId,
      timeSlots: initialAvailabilityData.timeSlots,
      calculatedDates: initialAvailabilityData.calculatedDates,
      stats: initialAvailabilityData.stats,
      requestedConfiguration: initialAvailabilityData.requestedConfiguration,
      queriedAt: new Date().toISOString(),
    };
  }, [initialAvailabilityData, subScenarioId]);

  const {
    availableSlotIds,
    isLoading: isLoadingAvailability,
    error: availabilityError,
    checkAvailability,
    checkSlotAvailability,
    getSlotStatus,
  } = useAvailabilityConfiguration({
    initialData: initialDataFormatted,
  });

  // Hook de selección de slots
  const slotSelection = useTimeSlotSelection(checkSlotAvailability, setConfig);
  const {
    selectedSlots,
    toggleTimeSlot,
    applySmartShortcut,
    selectPeriodHours,
    clearAllTimeSlots,
    clearPeriodSlots,
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
    // If there's a date from URL, use it; otherwise fallback to today
    const dateToUse = restoredRange.from || getTodayInColombia();
    handleStartDateChange(dateToUse);

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
  const { hasRestoredFromURL } = useURLPersistence(
    config,
    dateRange,
    selectedWeekdays,
    handleRestoreConfig,
    handleRestoreDateRange,
    handleRestoreWeekdays
  );

  // Auto-consultar cuando cambie la configuración (solo si no tenemos datos iniciales)
  useEffect(() => {
    // NO ejecutar hasta que la URL haya sido procesada
    if (!hasRestoredFromURL) {
      return;
    }

    // Si tenemos datos iniciales y la configuración coincide con los datos iniciales, no hacer nueva consulta
    if (initialDataFormatted) {
      const configMatches =
        availabilityConfig.initialDate === initialDataFormatted.requestedConfiguration.initialDate &&
        availabilityConfig.finalDate === initialDataFormatted.requestedConfiguration.finalDate &&
        JSON.stringify(availabilityConfig.weekdays) === JSON.stringify(initialDataFormatted.requestedConfiguration.weekdays);

      if (configMatches) {
        return;
      }
    }

    checkAvailability(availabilityConfig);
  }, [availabilityConfig, checkAvailability, initialDataFormatted, hasRestoredFromURL]);

  // Generar timeSlots con estado de disponibilidad
  const timeSlots = useMemo(() => {
    // Si tenemos datos iniciales, usar esos timeSlots con IDs reales
    if (initialAvailabilityData?.timeSlots) {
      const convertedSlots = convertBackendTimeSlotsToUI(
        initialAvailabilityData.timeSlots,
        getSlotStatus
      );
      return convertedSlots;
    }

    // Fallback: generar timeSlots tradicionales si no hay datos iniciales
    const generatedSlots = generateTimeSlots((hour) => getSlotStatus(hour));
    return generatedSlots;
  }, [initialAvailabilityData?.timeSlots, getSlotStatus]);

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
    <div className="w-full space-y-4 sm:space-y-6">
      <Card className="border-2 shadow-lg transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Reserva tu horario
            {isLoadingAvailability && (
              <FiLoader className="h-4 w-4 animate-spin text-primary-500" />
            )}
            
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
                selectedDate={dateRange.from || getTodayInColombia()}
                onSlotToggle={toggleTimeSlot}
                onPeriodSelect={selectPeriodHours}
                onPeriodClear={clearPeriodSlots}
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
            timeSlots={timeSlots}
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

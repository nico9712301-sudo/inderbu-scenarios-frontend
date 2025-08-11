import { ConfirmationSectionProps } from "../../types/scheduler.types";
import { CalendarCheck, CalendarCheck2, Zap } from "lucide-react";
import { ReservationSummary } from "../atoms/reservation-summary";
import { Button } from "@/shared/ui/button";
import { FiLoader } from "react-icons/fi";

export const ConfirmationSection = ({
  dateRange,
  selectedSlots,
  selectedWeekdays,
  config,
  isSubmitting,
  isLoading,
  onSubmit,
  onClear,
}: ConfirmationSectionProps) => {
  const selectedCount = selectedSlots.size;

  return (
    <div className="space-y-4">
      <ReservationSummary
        dateRange={dateRange}
        selectedSlots={selectedSlots}
        selectedWeekdays={selectedWeekdays}
        config={config}
      />

      <div className="relative">
        {selectedCount > 0 && !isSubmitting && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg blur-xl opacity-20 -z-10 pointer-events-none" />
        )}

        <Button
          className={`relative w-full font-semibold py-4 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl z-10 ${
            selectedCount > 0
              ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              : "bg-gray-300 text-gray-600"
          }`}
          size="lg"
          onClick={onSubmit}
          disabled={selectedCount === 0 || isSubmitting || isLoading}
        >
          {isSubmitting ? (
            <>
              <FiLoader className="h-5 w-5 mr-2 animate-spin" />
              Procesando tu reserva...
            </>
          ) : (
            <>
              <CalendarCheck2 className="h-5 w-5 mr-2"/>
              Confirmar mi reserva ({selectedCount} horario
              {selectedCount !== 1 ? "s" : ""})
            </>
          )}
        </Button>
      </div>

      {selectedCount > 0 && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
          >
            Limpiar selección
          </Button>
        </div>
      )}
    </div>
  );
};

import { Check, X, Clock } from "lucide-react";
import { FiLoader } from "react-icons/fi";
import { Button } from "@/shared/ui/button";
import { TimeSlotButtonProps } from "../../types/scheduler.types";
import { isTimeSlotPassed } from "../../utils/slot-validators";

export const TimeSlotButton = ({
  slot,
  isSelected,
  isLoading,
  selectedDate,
  onToggle
}: TimeSlotButtonProps) => {
  const isOccupied = slot.status === 'occupied';
  const isUnknown = slot.status === 'unknown';

  // Verificar si el slot ya pasó (solo si tenemos startTime)
  const hasPassed = slot.startTime ? isTimeSlotPassed(slot.startTime, selectedDate) : false;

  // El slot está deshabilitado si está ocupado, cargando, o ya pasó
  const isDisabled = isOccupied || isLoading || hasPassed;

  const getButtonStyles = () => {
    if (isSelected) {
      return "bg-primary !text-white !border-primary-700 shadow-md font-medium";
    }
    if (hasPassed) {
      return "opacity-40 cursor-not-allowed !bg-gray-50 !border-gray-200 !text-gray-400";
    }
    if (isOccupied) {
      return "opacity-50 cursor-not-allowed !bg-red-50 !border-red-200 !text-red-400";
    }
    return "border-primary-200 bg-white hover:bg-primary hover:border-primary-300";
  };

  return (
    <Button
      variant="outline"
      disabled={isDisabled}
      className={`h-10 text-sm transition-all duration-200 relative ${getButtonStyles()}`}
      onClick={() => onToggle(slot.hour)}
    >
      {isSelected && <Check className="h-4 w-4 mr-2 text-white" />}
      {isOccupied && <X className="h-4 w-4 mr-2 text-red-500" />}
      {hasPassed && <Clock className="h-4 w-4 mr-2 text-gray-400" />}
      {isUnknown && isLoading && <FiLoader className="h-4 w-4 mr-2 animate-spin" />}
      {slot.label}
    </Button>
  );
};

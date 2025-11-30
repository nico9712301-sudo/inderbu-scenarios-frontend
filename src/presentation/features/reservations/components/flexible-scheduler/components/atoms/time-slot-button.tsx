import { Check, X } from "lucide-react";
import { FiLoader } from "react-icons/fi";
import { Button } from "@/shared/ui/button";
import { TimeSlotButtonProps } from "../../types/scheduler.types";

export const TimeSlotButton = ({ 
  slot, 
  isSelected, 
  isLoading, 
  onToggle 
}: TimeSlotButtonProps) => {
  const isAvailable = slot.status === 'available';
  const isOccupied = slot.status === 'occupied';
  const isUnknown = slot.status === 'unknown';

  return (
    <Button
      variant="outline"
      disabled={isOccupied || isLoading}
      className={`h-10 text-sm transition-all duration-200 relative hover:scale-105 ${
        isSelected
          ? "!bg-primary-600 !text-white !border-primary-700 hover:!bg-primary-700 shadow-md font-medium"
          : isOccupied
          ? "opacity-50 cursor-not-allowed !bg-red-50 !border-red-200 !text-red-400"
          : isUnknown
          ? "opacity-70 !bg-gray-50"
          : "hover:bg-primary-50 border-primary-200 bg-white hover:shadow-md"
      }`}
      onClick={() => onToggle(slot.hour)}
    >
      {isSelected && <Check className="h-4 w-4 mr-2 text-white" />}
      {isOccupied && <X className="h-4 w-4 mr-2 text-red-500" />}
      {isUnknown && isLoading && <FiLoader className="h-4 w-4 mr-2 animate-spin" />}
      {slot.label}
    </Button>
  );
};

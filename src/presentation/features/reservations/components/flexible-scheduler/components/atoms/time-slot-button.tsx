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
      variant={isSelected ? "secondary" : "outline"}
      disabled={isOccupied || isLoading}
      className={`h-10 text-sm transition-all duration-200 relative hover:scale-105 ${
        isSelected
          ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200 shadow-md"
          : isOccupied
          ? "opacity-50 cursor-not-allowed bg-red-50 border-red-200 text-red-400"
          : isUnknown
          ? "opacity-70 bg-gray-50"
          : "hover:bg-green-50 border-green-200 bg-white hover:shadow-md"
      }`}
      onClick={() => onToggle(slot.hour)}
    >
      {isSelected && <Check className="h-4 w-4 mr-2 text-green-600" />}
      {isOccupied && <X className="h-4 w-4 mr-2 text-red-500" />}
      {isUnknown && isLoading && <FiLoader className="h-4 w-4 mr-2 animate-spin" />}
      {slot.label}
    </Button>
  );
};

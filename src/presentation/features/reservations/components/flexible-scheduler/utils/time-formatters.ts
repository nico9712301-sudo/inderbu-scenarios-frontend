import { TimeSlot } from "../types/scheduler.types";

/**
 * Formatea una hora en formato humano legible
 */
export const formatHourHuman = (hour: number): string => {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

/**
 * Genera slots de tiempo con estado de disponibilidad
 */
export const generateTimeSlots = (
  availabilityChecker?: (hour: number) => 'available' | 'occupied' | 'unknown'
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push({
      hour,
      label: formatHourHuman(hour),
      selected: false,
      status: availabilityChecker ? availabilityChecker(hour) : 'unknown',
    });
  }
  return slots;
};

/**
 * Obtiene los slots disponibles en un período específico
 */
export const getAvailableSlotsInPeriod = (
  periodHours: number[],
  availabilityChecker: (hour: number) => boolean
): number[] => {
  return periodHours.filter(hour => availabilityChecker(hour));
};

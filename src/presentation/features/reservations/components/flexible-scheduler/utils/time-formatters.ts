import { TimeSlot } from "../types/scheduler.types";

interface BackendTimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  isAvailableInAllDates: boolean;
}

/**
 * Convierte un tiempo en formato "HH:mm:ss" a hora (número)
 */
const timeToHour = (time: string): number => {
  const [hours] = time.split(':');
  return parseInt(hours);
};

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
  for (let hour = 1; hour < 25; hour++) {
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
 * Convierte timeSlots del backend al formato esperado por la UI
 */
export const convertBackendTimeSlotsToUI = (
  backendSlots: BackendTimeSlot[],
  availabilityChecker?: (slotId: number) => 'available' | 'occupied' | 'unknown'
): TimeSlot[] => {
  return backendSlots.map(slot => {
    const hour = timeToHour(slot.startTime);
    return {
      hour: slot.id, // Usar el ID real del backend en lugar del hour
      label: formatHourHuman(hour), // Pero mostrar la hora formateada
      selected: false,
      status: availabilityChecker ? availabilityChecker(slot.id) :
              (slot.isAvailableInAllDates ? 'available' : 'occupied'),
    };
  });
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

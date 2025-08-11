import { toast } from "sonner";
import { formatHourHuman } from "./time-formatters";

/**
 * Valida si un slot está disponible para reserva
 */
export const validateSlotAvailability = (
  hour: number,
  checkSlotAvailability: (hour: number) => boolean
): boolean => {
  if (!checkSlotAvailability(hour)) {
    toast.error(`${formatHourHuman(hour)} ya está ocupado`);
    return false;
  }
  return true;
};

/**
 * Valida múltiples slots y retorna los no disponibles
 */
export const getUnavailableSlots = (
  selectedSlots: number[],
  checkSlotAvailability: (hour: number) => boolean
): number[] => {
  return selectedSlots.filter(slot => !checkSlotAvailability(slot));
};

/**
 * Valida si hay al menos un slot seleccionado
 */
export const validateMinimumSelection = (selectedSlotsCount: number): boolean => {
  if (selectedSlotsCount === 0) {
    toast.error("Por favor selecciona al menos un horario para reservar");
    return false;
  }
  return true;
};

/**
 * Valida si hay una fecha seleccionada
 */
export const validateDateSelection = (date: string | undefined): boolean => {
  if (!date) {
    toast.error("Por favor selecciona una fecha");
    return false;
  }
  return true;
};

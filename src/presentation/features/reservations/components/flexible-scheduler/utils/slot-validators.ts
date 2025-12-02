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

/**
 * Obtiene la hora actual en zona horaria de Colombia (GMT-5)
 */
export const getCurrentColombiaTime = (): Date => {
  const now = new Date();
  // Usar toLocaleString para obtener la hora en zona horaria de Colombia
  const colombiaTimeString = now.toLocaleString("en-US", {
    timeZone: "America/Bogota"
  });
  return new Date(colombiaTimeString);
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD usando zona horaria de Colombia
 */
export const getTodayInColombia = (): string => {
  const todayInColombia = getCurrentColombiaTime();
  const year = todayInColombia.getFullYear();
  const month = String(todayInColombia.getMonth() + 1).padStart(2, '0');
  const day = String(todayInColombia.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Verifica si un horario ya pasó basado en la hora actual
 * Solo aplica para reservas del día de hoy
 */
export const isTimeSlotPassed = (
  slotStartTime: string,
  selectedDate: string
): boolean => {
  const today = getCurrentColombiaTime();

  // Parsear la fecha seleccionada correctamente evitando problemas de timezone
  const [year, month, day] = selectedDate.split('-').map(Number);

  // Normalizar las fechas para comparar solo año/mes/día
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedNormalized = new Date(year, month - 1, day); // month es 0-indexed

  // Solo validar si es el día de hoy
  if (selectedNormalized.getTime() !== todayNormalized.getTime()) {
    return false; // Si no es hoy, no ha pasado
  }

  // Parsear la hora del slot (formato "HH:MM:SS")
  const [hours, minutes] = slotStartTime.split(':').map(Number);
  const slotDateTime = new Date(today);
  slotDateTime.setHours(hours, minutes, 0, 0);

  // Comparar con la hora actual + 30 minutos de buffer para permitir reservas próximas
  const bufferMinutes = 30;
  const currentTimePlusBuffer = new Date(today.getTime() + (bufferMinutes * 60 * 1000));

  return slotDateTime <= currentTimePlusBuffer;
};

/**
 * Valida si un slot está disponible considerando hora actual y disponibilidad
 */
export const validateSlotAvailabilityWithTime = (
  hour: number,
  slotStartTime: string,
  selectedDate: string,
  checkSlotAvailability: (hour: number) => boolean
): boolean => {
  // Primero verificar disponibilidad básica
  if (!checkSlotAvailability(hour)) {
    toast.error(`Este horario ya está ocupado`);
    return false;
  }

  // Luego verificar si ya pasó la hora
  if (isTimeSlotPassed(slotStartTime, selectedDate)) {
    toast.error(`Este horario ya pasó`);
    return false;
  }

  return true;
};

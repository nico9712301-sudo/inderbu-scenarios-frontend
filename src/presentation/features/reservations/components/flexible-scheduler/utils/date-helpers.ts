import { format, parseISO } from "date-fns";

/**
 * Obtiene la fecha de hoy en formato ISO
 */
export const getTodayISO = (): string => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Formatea una fecha de manera segura
 */
export const formatDateSafe = (dateStr: string | undefined): string => {
  if (!dateStr) return "";
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy");
  } catch {
    return dateStr;
  }
};

/**
 * Valida si una fecha final es mayor que la inicial (no igual)
 */
export const validateDateRange = (startDate: string, endDate: string): boolean => {
  return endDate > startDate; // Cambiar >= por > para no permitir fechas iguales
};

/**
 * Obtiene el día siguiente a la fecha dada
 */
export const getNextDay = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
};

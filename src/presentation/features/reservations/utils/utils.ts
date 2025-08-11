import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ReservationDto } from "@/services/reservation.service";

const getWeekDayNames = (weekDays: number[]) => {
  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  return weekDays.map((day) => days[day]);
};

export const formatReservationInfo = (reservation: ReservationDto) => {
  try {
    const initialDate = parseISO(reservation.initialDate);
    const isRange = reservation.type === "RANGE" && reservation.finalDate;

    if (isRange) {
      const finalDate = parseISO(reservation.finalDate!);

      return {
        type: "RANGE",
        startDate: format(initialDate, "EEEE d 'de' MMMM 'de' yyyy", {
          locale: es,
        }),
        endDate: format(finalDate, "EEEE d 'de' MMMM 'de' yyyy", {
          locale: es,
        }),
        shortRange: `${format(initialDate, "dd/MM/yyyy")} - ${format(finalDate, "dd/MM/yyyy")}`,
        weekDays: reservation.weekDays || [],
        weekDayNames: getWeekDayNames(reservation.weekDays || []),
        totalInstances: reservation.totalInstances || 1,
        durationDays:
          Math.ceil(
            (finalDate.getTime() - initialDate.getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1,
      };
    } else {
      return {
        type: "SINGLE",
        startDate: format(initialDate, "EEEE d 'de' MMMM 'de' yyyy", {
          locale: es,
        }),
        shortDate: format(initialDate, "dd/MM/yyyy"),
        totalInstances: reservation.totalInstances || 1,
      };
    }
  } catch (error) {
    console.error("Error formatting reservation:", error);
    return {
      type: "SINGLE",
      startDate: "Fecha inválida",
      shortDate: "Fecha inválida",
      totalInstances: 1,
    };
  }
};

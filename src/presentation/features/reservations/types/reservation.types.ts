export interface ITimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  dayOfWeek?: number;
  available: boolean;
}

export interface ReservationPayload {
  subScenarioId: number;
  timeSlotId: number;
  reservationDate: string;
}

export interface ReservationStatus {
  id: number;
  state: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "CANCELADA";
}

export interface ReservationStats {
  total: number;
  active: number;
  past: number;
  pending: number;
  confirmed: number;
  cancelled: number;
}

import { z } from "zod";

// Domain entities matching exactly the current working service and backend structure

export interface City {
  id: number;
  name: string;
}

export interface Commune {
  id: number;
  name: string;
  city: City;
}

export interface Neighborhood {
  id: number;
  name: string;
  commune: Commune;
}

export interface Scenario {
  id: number;
  name: string;
  address: string;
  neighborhood: Neighborhood;
}

export interface SubScenario {
  id: number;
  name: string;
  hasCost: boolean;
  numberOfSpectators: number | null;
  numberOfPlayers: number | null;
  recommendations: string | null;
  scenarioId: number;
  scenarioName: string;
  scenario: Scenario;
}

export interface User {
  id: number;
  first_name: string; // Backend uses first_name, not name
  last_name: string; // Backend uses last_name, not lastName
  email: string;
  phone: string;
}

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  // Note: No 'day' field in backend
}

export interface ReservationState {
  id: number;
  state: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "CANCELADA";
  // Note: No 'description' field in backend
}

export interface TimeSlotDto {
  id: number;
  startTime: string;
  endTime: string;
}

export interface ReservationStateDto {
  id: number;
  state: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "CANCELADA";
  description?: string;
}

// Main reservation entity (matching the current working ReservationDto)
export interface ReservationDto {
  /* ─── valores crudos del backend ─── */
  id: number;
  type: "SINGLE" | "RANGE";
  subScenarioId: number;
  userId: number;
  initialDate: string;
  finalDate: string | null;
  weekDays: number[] | null;
  comments?: string | null;
  reservationStateId: number;
  totalInstances: number;
  createdAt: string;
  updatedAt: string;

  /* ─── objetos anidados ─── */
  subScenario: {
    id: number;
    name: string;

    /* props antiguas opcionales → evita romper UI */
    hasCost?: boolean;
    numberOfSpectators?: number | null;
    numberOfPlayers?: number | null;
    recommendations?: string | null;
    scenarioId?: number;
    scenarioName?: string;
    scenario?: Scenario;
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  reservationState: ReservationStateDto;
  timeslots: TimeSlotDto[];

  /* ─── shims legacy ─── */
  reservationDate?: string;  // alias de initialDate
  timeSlot?: TimeSlotDto;    // primer slot
  timeSlotId?: number;       // id del primer slot
}

export interface PaginatedReservations {
  data: ReservationDto[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

// Command DTOs for mutations (matching backend request DTOs)
export interface CreateReservationDto {
  subScenarioId: number;
  timeSlotIds: number[];
  reservationRange: {
    initialDate: string; // YYYY-MM-DD format
    finalDate?: string;
  };
  comments?: string;
  weekdays?: number[];
}

export interface CreateReservationResponseDto {
  id: number;
  reservationDate: string;
  subScenarioId: number;
  userId: number;
  timeSlotId: number;
  reservationStateId: number;
  comments?: string;
}

export interface UpdateReservationStateCommand {
  reservationStateId: number; // FIXED: backend expects reservationStateId, not stateId
  additionalReservationIds?: number[]; // NUEVO: Para operaciones múltiples
}

export interface BulkUpdateResult {
  success: boolean;
  updatedCount: number;
  errors?: Array<{ reservationId: number; error: string }>;
  data?: ReservationDto[];
  message?: string;
  error?: string;
}

export interface ReservationStateDto {
  id: number;
  state: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "CANCELADA";
}

export interface TimeslotResponseDto {
  id: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean; // FIXED: Cambiar de 'available' a 'isAvailable' para coincidir con backend
}

// Query parameters interface (matching current service filters)
export interface GetReservationsQuery {
  scenarioId?: number;
  activityAreaId?: number;
  neighborhoodId?: number;
  userId?: number;
  page?: number;
  limit?: number;
  searchQuery?: string;
  dateFrom?: string; // YYYY-MM-DD format
  dateTo?: string; // YYYY-MM-DD format
}

// Validation schemas (updated to match backend requirements)
export const CreateReservationSchema = z.object({
  subScenarioId: z.number().int().positive(),
  timeSlotIds: z.array(z.number().int().positive()),
  reservationRange: z.object({
    initialDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    finalDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  }),
  comments: z.string().optional(),
  weekdays: z.array(z.number().int().min(0).max(6)).optional(),
});

export const UpdateReservationStateSchema = z.object({
  reservationStateId: z.number().int().positive(),
});

export const GetReservationsQuerySchema = z.object({
  scenarioId: z.number().int().positive().optional(),
  activityAreaId: z.number().int().positive().optional(),
  neighborhoodId: z.number().int().positive().optional(),
  userId: z.number().int().positive().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20), // Backend default is 20
  searchQuery: z.string().optional(),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

// Type guards
export const isActiveReservation = (reservation: ReservationDto): boolean => {
  const now = new Date();
  const reservationDate = new Date(reservation.reservationDate || reservation.initialDate);

  return (
    reservationDate >= now &&
    reservation.reservationState.state !== "CANCELADA" &&
    reservation.reservationState.state !== "RECHAZADA"
  );
};

export const isPastReservation = (reservation: ReservationDto): boolean => {
  return !isActiveReservation(reservation);
};

// Business logic helpers
export const calculateReservationStats = (reservations: ReservationDto[]) => {
  const active = reservations.filter(isActiveReservation);
  const past = reservations.filter(isPastReservation);

  return {
    total: reservations.length,
    active: active.length,
    past: past.length,
    pending: reservations.filter(
      (r) => r.reservationState.state === "PENDIENTE"
    ).length,
    confirmed: reservations.filter(
      (r) => r.reservationState.state === "CONFIRMADA"
    ).length,
    rejected: reservations.filter(
      (r) => r.reservationState.state === "RECHAZADA"
    ).length,
    cancelled: reservations.filter(
      (r) => r.reservationState.state === "CANCELADA"
    ).length,
  };
};

// Helper to get user full name (since backend splits first_name and last_name)
export const getUserFullName = (user: User): string => {
  return `${user.first_name} ${user.last_name}`.trim();
};

// Helper to format scenario full location
export const getScenarioFullLocation = (subScenario: SubScenario): string => {
  const { scenario } = subScenario;
  return scenario.address;
};

// Helper to check if reservation can be modified
export const canModifyReservation = (reservation: ReservationDto): boolean => {
  return (
    isActiveReservation(reservation) &&
    (reservation.reservationState.state === "PENDIENTE" ||
      reservation.reservationState.state === "CONFIRMADA")
  );
};

// Helper to get status color for UI
export const getReservationStatusColor = (state: string) => {
  switch (state) {
    case "CONFIRMADA":
      return "success"; // green
    case "PENDIENTE":
      return "warning"; // yellow
    case "CANCELADA":
      return "destructive"; // red
    case "RECHAZADA":
      return "destructive"; // red
    default:
      return "secondary";
  }
};

// Helper to get status icon for UI
export const getReservationStatusIcon = (state: string) => {
  switch (state) {
    case "CONFIRMADA":
      return "";
    case "PENDIENTE":
      return "...";
    case "CANCELADA":
      return "X";
    case "RECHAZADA":
      return "X";
    default:
      return "*";
  }
};

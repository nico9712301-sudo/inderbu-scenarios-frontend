import { ReservationDto } from '@/entities/reservation/model/types';

export interface PaginatedReservations {
  data: ReservationDto[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ReservationFilters {
  page?: number;
  limit?: number;
  scenarioId?: number;
  activityAreaId?: number;
  neighborhoodId?: number;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
  reservationStateIds?: number[];
}

export interface IReservationRepository {
  getAll(filters: ReservationFilters): Promise<PaginatedReservations>;
  getAllSimple(filters?: Record<string, any>): Promise<ReservationDto[]>;
  updateState(reservationId: number, reservationStateId: number): Promise<ReservationDto>;
}

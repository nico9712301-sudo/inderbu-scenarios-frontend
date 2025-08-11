import { ReservationDto } from '@/services/reservation.service';

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
}

export interface IReservationRepository {
  getAllWithPagination(filters: ReservationFilters): Promise<PaginatedReservations>;
  getAll(filters?: Record<string, any>): Promise<ReservationDto[]>;
  updateState(reservationId: number, reservationStateId: number): Promise<ReservationDto>;
}

import { ReservationEntity, ReservationSearchCriteria } from '../domain/ReservationEntity';
import { PageMeta } from '@/services/api';

export interface ReservationFilters {
  page?: number;
  limit?: number;
  search?: string;
  scenarioId?: number;
  activityAreaId?: number;
  neighborhoodId?: number;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
  active?: boolean;
}

export interface PaginatedReservations {
  data: ReservationEntity[];
  meta: PageMeta;
}

// Clean repository interface working only with Domain Entities
export interface IReservationRepository {
  getAll(filters?: ReservationFilters): Promise<PaginatedReservations>;
  getById(id: number): Promise<ReservationEntity | null>;
  getByUserId(userId: number, filters?: ReservationFilters): Promise<PaginatedReservations>;
  search(criteria: ReservationSearchCriteria): Promise<ReservationEntity[]>;
  create(data: Omit<ReservationEntity, 'id'>): Promise<ReservationEntity>;
  update(id: number, data: Partial<ReservationEntity>): Promise<ReservationEntity>;
  updateState(id: number, stateId: number): Promise<ReservationEntity>;
  delete(id: number): Promise<void>;
}
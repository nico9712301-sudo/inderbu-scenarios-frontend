import { ReservationEntity, ReservationSearchCriteria } from '../domain/ReservationEntity';
import { PageMeta } from '@/shared/api/pagination';

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

// DTOs for legacy compatibility
export interface CreateReservationDto {
  subScenarioId: number;
  timeSlotId: number;
  reservationDate: string; // YYYY-MM-DD
  comments?: string;
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

export interface TimeslotResponseDto {
  id: number;
  startTime: string;
  endTime: string;
  available?: boolean;
  isAvailable?: boolean;
}

export interface ReservationStateDto {
  id: number;
  name?: string;
  state?: string;
  description?: string;
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
  
  // Additional methods from legacy service
  getAvailableTimeSlots(subScenarioId: number, date: string): Promise<TimeslotResponseDto[]>;
  createReservation(data: CreateReservationDto): Promise<CreateReservationResponseDto>;
  getAllReservationStates(): Promise<ReservationStateDto[]>;
}
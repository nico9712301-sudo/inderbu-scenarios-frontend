import { PageMetaDto } from '@/shared/api';
import { ReservationEntity, ReservationSearchCriteria } from '../domain/ReservationEntity';

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
  meta: PageMetaDto;
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

// Availability interfaces migrated from legacy
export interface AvailabilityConfiguration {
  subScenarioId: number;
  initialDate: string;
  finalDate?: string;
  weekdays?: number[];
}

export interface TimeSlotBasic {
  id: number;
  startTime: string;
  endTime: string;
  isAvailableInAllDates: boolean;
}

export interface AvailabilityStats {
  totalDates: number;
  totalTimeslots: number;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  globalAvailabilityPercentage: number;
  datesWithFullAvailability: number;
  datesWithNoAvailability: number;
}

export interface SimplifiedAvailabilityResponse {
  subScenarioId: number;
  requestedConfiguration: {
    initialDate: string;
    finalDate?: string;
    weekdays?: number[];
  };
  calculatedDates: string[];
  timeSlots: TimeSlotBasic[];
  stats: AvailabilityStats;
  queriedAt: string;
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
  
  // Availability configuration method migrated from legacy
  getAvailabilityForConfiguration(config: AvailabilityConfiguration): Promise<SimplifiedAvailabilityResponse>;
}
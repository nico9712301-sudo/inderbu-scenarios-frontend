import { 
  IReservationRepository, 
  PaginatedReservations, 
  ReservationFilters,
  CreateReservationDto,
  CreateReservationResponseDto,
  TimeslotResponseDto,
  ReservationStateDto,
  AvailabilityConfiguration,
  SimplifiedAvailabilityResponse
} from '@/entities/reservation/infrastructure/IReservationRepository';
import { ReservationEntity, ReservationSearchCriteria, ReservationDomainError } from '@/entities/reservation/domain/ReservationEntity';

import { BackendResponse, BackendPaginatedResponse } from '@/shared/api/backend-types';
import { IHttpClient } from '@/shared/api/types';

import { ReservationTransformer, ReservationBackend } from '@/infrastructure/transformers/ReservationTransformer';

import { executeWithDomainError } from './execute-with-domain-error.wrapper';

/**
 * Reservation Repository Implementation
 * 
 * Handles HTTP requests for reservation operations.
 * Uses server-side HTTP client with authentication context.
 */
export class ReservationRepository implements IReservationRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  async getAll(filters?: ReservationFilters): Promise<PaginatedReservations> {
    return executeWithDomainError(async () => {
      // Build query params from filters
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.scenarioId) params.append('scenarioId', filters.scenarioId.toString());
      if (filters?.activityAreaId) params.append('activityAreaId', filters.activityAreaId.toString());
      if (filters?.neighborhoodId) params.append('neighborhoodId', filters.neighborhoodId.toString());
      if (filters?.userId) params.append('userId', filters.userId.toString());
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.active !== undefined) params.append('active', filters.active.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      else params.append('limit', '20'); // Default limit

      // Call HTTP client with filters
      const result = await this.httpClient.get<BackendPaginatedResponse<ReservationBackend>>(
        `/reservations?${params.toString()}`
      );
      
      // Transform backend data to domain entities
      const transformedData: ReservationEntity[] = result.data.map(reservationData => 
        ReservationTransformer.toDomain(reservationData)
      );

      return {
        data: transformedData,
        meta: result.meta,
      };
    }, 'Failed to fetch reservations');
  }

  async getByUserId(userId: number, filters?: ReservationFilters): Promise<PaginatedReservations> {
    return executeWithDomainError(async () => {
      // Add userId to filters
      const userFilters = {
        ...filters,
        userId,
        limit: filters?.limit || 6 // Default for user reservations
      };

      // Use getAll with user filter
      return await this.getAll(userFilters);
    }, `Failed to fetch user ${userId} reservations`);
  }

  async getById(id: number): Promise<ReservationEntity | null> {
    return executeWithDomainError(async () => {
      const result = await this.httpClient.get<ReservationBackend>(`/reservations/${id}`);
      
      // Transform backend data to domain entity
      return ReservationTransformer.toDomain(result) as ReservationEntity;
    }, `Failed to fetch reservation ${id}`);
  }

  async search(criteria: ReservationSearchCriteria): Promise<ReservationEntity[]> {
    return executeWithDomainError(async () => {
      if (!criteria.isValid()) {
        throw new ReservationDomainError('Invalid search criteria');
      }

      const allReservationsResult = await this.getAll();
      
      let filtered = allReservationsResult.data;

      // Filter by search query
      if (criteria.searchQuery) {
        filtered = filtered.filter(entity => 
          entity.matchesSearchQuery(criteria.searchQuery!)
        );
      }

      // Filter by user ID
      if (criteria.userId) {
        filtered = filtered.filter(entity => 
          entity.belongsToUser(criteria.userId!)
        );
      }

      // Filter by sub-scenario ID
      if (criteria.subScenarioId) {
        filtered = filtered.filter(entity => 
          entity.belongsToSubScenario(criteria.subScenarioId!)
        );
      }

      // Filter by state
      if (criteria.state) {
        filtered = filtered.filter(entity => 
          entity.reservationState.state === criteria.state
        );
      }

      // Filter by active status
      if (criteria.active !== undefined) {
        filtered = filtered.filter(entity => 
          entity.isActive() === criteria.active
        );
      }

      // Apply limit
      if (criteria.limit && criteria.limit > 0) {
        filtered = filtered.slice(0, criteria.limit);
      }

      return filtered;
    }, 'Failed to search reservations');
  }

  async create(data: Omit<ReservationEntity, "id">): Promise<ReservationEntity> {
    return executeWithDomainError(async () => {
      // Transform domain entity to backend format for API call
      const backendData = ReservationTransformer.toBackend(data as ReservationEntity);
      
      // Call backend API
      const result = await this.httpClient.post<BackendResponse<ReservationBackend>>('/reservations', backendData);
      
      // Transform response back to domain entity
      return ReservationTransformer.toDomain(result.data) as ReservationEntity;
    }, 'Failed to create reservation');
  }

  async update(id: number, data: Partial<ReservationEntity>): Promise<ReservationEntity> {
    return executeWithDomainError(async () => {
      // Get existing entity and merge with updates
      const existing = await this.getById(id);
      if (!existing) {
        throw new ReservationDomainError(`Reservation with id ${id} not found`);
      }

      // Create updated entity and transform to backend format
      const updatedEntity = { ...existing, ...data } as ReservationEntity;
      const backendData = ReservationTransformer.toBackend(updatedEntity);
      
      // Call backend API
      const result = await this.httpClient.put<BackendResponse<ReservationBackend>>(`/reservations/${id}`, backendData);
      
      // Transform response back to domain entity  
      return ReservationTransformer.toDomain(result.data) as ReservationEntity;
    }, `Failed to update reservation ${id}`);
  }

  async updateState(id: number, stateId: number): Promise<ReservationEntity> {
    return executeWithDomainError(async () => {
      // Call backend API with state update
      const result = await this.httpClient.patch<BackendResponse<ReservationBackend>>(
        `/reservations/${id}/state`, 
        { reservationStateId: stateId }
      );
      
      // Transform response back to domain entity
      return ReservationTransformer.toDomain(result.data) as ReservationEntity;
    }, `Failed to update reservation ${id} state`);
  }

  async delete(id: number): Promise<void> {
    return executeWithDomainError(async () => {
      await this.httpClient.delete(`/reservations/${id}`);
    }, `Failed to delete reservation ${id}`);
  }

  // Legacy compatibility methods
  async getAvailableTimeSlots(subScenarioId: number, date: string): Promise<TimeslotResponseDto[]> {
    return executeWithDomainError(async () => {
      const url = `/reservations/availability?subScenarioId=${subScenarioId}&initialDate=${date}`;
      
      const result = await this.httpClient.get<BackendResponse<any>>(url);
      
      // Handle backend response structure
      const data = result.data || result;
      
      if (data && data.timeSlots && Array.isArray(data.timeSlots)) {
        return data.timeSlots.map((slot: any) => ({
          id: slot.id,
          startTime: slot.startTime.substring(0, 5), // "09:00:00" -> "09:00"
          endTime: slot.endTime.substring(0, 5),     // "10:00:00" -> "10:00"
          available: slot.isAvailableInAllDates,
          isAvailable: slot.isAvailableInAllDates
        }));
      }
      
      return [];
    }, `Failed to fetch available timeslots for sub-scenario ${subScenarioId}`);
  }

  async createReservation(data: CreateReservationDto): Promise<CreateReservationResponseDto> {
    return executeWithDomainError(async () => {
      const result = await this.httpClient.post<BackendResponse<CreateReservationResponseDto>>(
        '/reservations',
        data
      );
      
      return result.data || result;
    }, 'Failed to create reservation (legacy method)');
  }

  async getAllReservationStates(): Promise<ReservationStateDto[]> {
    return executeWithDomainError(async () => {
      const result = await this.httpClient.get<BackendResponse<ReservationStateDto[]>>('/reservations/states');
      
      return result.data || result || [];
    }, 'Failed to fetch reservation states');
  }

  // Migrated from legacy: Availability configuration method
  async getAvailabilityForConfiguration(config: AvailabilityConfiguration): Promise<SimplifiedAvailabilityResponse> {
    return executeWithDomainError(async () => {
      const searchParams = new URLSearchParams({
        subScenarioId: config.subScenarioId.toString(),
        initialDate: config.initialDate,
      });

      if (config.finalDate) {
        searchParams.set('finalDate', config.finalDate);
      }

      if (config.weekdays && config.weekdays.length > 0) {
        searchParams.set('weekdays', config.weekdays.join(','));
      }

      const cacheConfig = {
        next: {
          tags: [
            `availability-config-${config.subScenarioId}-${config.initialDate}`,
            `availability-${config.subScenarioId}`,
            "availability",
          ],
          revalidate: 300, // 5 minutos
        },
      };

      console.log(
        `Calling availability configuration endpoint: /reservations/availability?${searchParams.toString()}`
      );

      const url = `/reservations/availability?${searchParams.toString()}`;

      const response = await this.httpClient.get<BackendResponse<SimplifiedAvailabilityResponse>>(
        url, 
        cacheConfig
      );

      // Handle both nested and direct response formats
      const data = response.data || response;

      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from availability configuration API');
      }

      return data;
    }, `Failed to fetch availability configuration for sub-scenario ${config.subScenarioId}`);
  }
}
// Infrastructure: Reservation Repository Adapter
import { ReservationEntity, ReservationSearchCriteria, ReservationDomainError } from '@/entities/reservation/domain/ReservationEntity';
import { IReservationRepository, PaginatedReservations, ReservationFilters } from '@/entities/reservation/infrastructure/IReservationRepository';
import { HttpClient } from '@/shared/api/types';
import { BackendResponse, BackendPaginatedResponse } from '@/shared/api/backend-types';
import { ReservationTransformer, ReservationBackend } from '@/infrastructure/transformers/ReservationTransformer';

/**
 * Reservation Repository Implementation
 * 
 * Handles HTTP requests for reservation operations.
 * Uses server-side HTTP client with authentication context.
 */
export class ReservationRepository implements IReservationRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(filters?: ReservationFilters): Promise<PaginatedReservations> {
    try {
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

    } catch (error) {
      console.error('ReservationRepository: Error in getAll:', error);
      throw new ReservationDomainError(`Failed to fetch reservations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getByUserId(userId: number, filters?: ReservationFilters): Promise<PaginatedReservations> {
    try {
      // Add userId to filters
      const userFilters = {
        ...filters,
        userId,
        limit: filters?.limit || 6 // Default for user reservations
      };

      // Use getAll with user filter
      return await this.getAll(userFilters);

    } catch (error) {
      console.error('ReservationRepository: Error in getByUserId:', error);
      throw new ReservationDomainError(`Failed to fetch user reservations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getById(id: number): Promise<ReservationEntity | null> {
    try {
      const result = await this.httpClient.get<ReservationBackend>(`/reservations/${id}`);
      
      // Transform backend data to domain entity
      return ReservationTransformer.toDomain(result) as ReservationEntity;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      console.error('ReservationRepository: Error in getById:', error);
      throw new ReservationDomainError(`Failed to fetch reservation ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(criteria: ReservationSearchCriteria): Promise<ReservationEntity[]> {
    try {
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

    } catch (error) {
      console.error('ReservationRepository: Error in search:', error);
      throw error;
    }
  }

  /**
   * Create a new reservation
   */
  async create(data: Omit<ReservationEntity, "id">): Promise<ReservationEntity> {
    try {
      // Transform domain entity to backend format for API call
      const backendData = ReservationTransformer.toBackend(data as ReservationEntity);
      
      // Call backend API
      const result = await this.httpClient.post<BackendResponse<ReservationBackend>>('/reservations', backendData);
      
      // Transform response back to domain entity
      return ReservationTransformer.toDomain(result.data) as ReservationEntity;
      
    } catch (error) {
      console.error('ReservationRepository: Error in create:', error);
      throw new ReservationDomainError(`Failed to create reservation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing reservation
   */
  async update(id: number, data: Partial<ReservationEntity>): Promise<ReservationEntity> {
    try {
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
      
    } catch (error) {
      console.error('ReservationRepository: Error in update:', error);
      throw new ReservationDomainError(`Failed to update reservation ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update reservation state
   */
  async updateState(id: number, stateId: number): Promise<ReservationEntity> {
    try {
      // Call backend API with state update
      const result = await this.httpClient.patch<BackendResponse<ReservationBackend>>(
        `/reservations/${id}/state`, 
        { reservationStateId: stateId }
      );
      
      // Transform response back to domain entity
      return ReservationTransformer.toDomain(result.data) as ReservationEntity;
      
    } catch (error) {
      console.error('ReservationRepository: Error in updateState:', error);
      throw new ReservationDomainError(`Failed to update reservation ${id} state: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.httpClient.delete(`/reservations/${id}`);
    } catch (error) {
      console.error('ReservationRepository: Error in delete:', error);
      throw new ReservationDomainError(`Failed to delete reservation ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Temporary factory function for legacy containers
export function createReservationRepositoryAdapter(httpClient: HttpClient): IReservationRepository {
  return new ReservationRepository(httpClient);
}
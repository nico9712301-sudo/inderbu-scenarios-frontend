// Infrastructure: Activity Area Repository Adapter (bridges existing API to domain interface)

import { IActivityAreaRepository, PaginatedActivityAreas, ActivityAreaFilters } from '@/entities/activity-area/domain/IActivityAreaRepository';
import { ActivityAreaEntity, ActivityAreaSearchCriteria, ActivityAreaDomainError } from '@/entities/activity-area/domain/ActivityAreaEntity';
import { ActivityArea } from '@/services/api';
import { HttpClient } from '@/shared/api/types';
import { BackendPaginatedResponse } from '@/shared/api/backend-types';
import { ActivityAreaTransformer } from '@/infrastructure/transformers/ActivityAreaTransformer';

// Infrastructure: Adapter Pattern - Bridge existing API to domain interface
export class ActivityAreaRepositoryAdapter implements IActivityAreaRepository {
  constructor(private readonly httpClient: HttpClient) { }


  async getAll(filters?: ActivityAreaFilters): Promise<PaginatedActivityAreas> {
    try {
      // Build query params from filters
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.active !== undefined) params.append('active', filters.active.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      else params.append('limit', '1000'); // Default high limit

      // Call HTTP client - backend always returns BackendPaginatedResponse
      const result: BackendPaginatedResponse<ActivityArea> = await this.httpClient.get<BackendPaginatedResponse<ActivityArea>>(
        `/activity-areas?${params.toString()}`
      );
      
      // Transform backend data to domain entities
      const transformedData: ActivityAreaEntity[] = result.data.map(activityAreaData => 
        ActivityAreaTransformer.toDomain(activityAreaData)
      );

      return {
        data: transformedData,
        meta: result.meta,
      };

    } catch (error) {
      console.error('ActivityAreaRepositoryAdapter: Error in getAll:', error);
      throw new ActivityAreaDomainError(`Failed to fetch activity areas: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getById(id: number): Promise<ActivityAreaEntity | null> {
    try {
      const allEntitiesResult = await this.getAll();
      return allEntitiesResult.data.find(entity => entity.id === id) || null;
    } catch (error) {
      console.error('ActivityAreaRepositoryAdapter: Error in getById:', error);
      throw error;
    }
  }

  async search(criteria: ActivityAreaSearchCriteria): Promise<ActivityAreaEntity[]> {
    try {
      if (!criteria.isValid()) {
        throw new ActivityAreaDomainError('Invalid search criteria');
      }

      const allEntitiesResult = await this.getAll();
      
      let filtered = allEntitiesResult.data;

      if (criteria.searchQuery) {
        filtered = filtered.filter(entity => 
          entity.matchesSearchQuery(criteria.searchQuery!)
        );
      }

      if (criteria.limit && criteria.limit > 0) {
        filtered = filtered.slice(0, criteria.limit);
      }

      return filtered;

    } catch (error) {
      console.error('ActivityAreaRepositoryAdapter: Error in search:', error);
      throw error;
    }
  }

  async create(data: Omit<ActivityAreaEntity, 'id'>): Promise<ActivityAreaEntity> {
    try {
      // Transform domain entity to backend format for API call
      const backendData = ActivityAreaTransformer.toBackend(data as ActivityAreaEntity);
      
      // Call backend API
      const result = await this.httpClient.post<BackendPaginatedResponse<ActivityArea>>('/activity-areas', backendData);
      
      // Transform response back to domain entity
      return ActivityAreaTransformer.toDomain(result.data[0]); // Assuming backend returns array with created item
      
    } catch (error) {
      console.error('ActivityAreaRepositoryAdapter: Error in create:', error);
      throw new ActivityAreaDomainError(`Failed to create activity area: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(id: number, data: Partial<ActivityAreaEntity>): Promise<ActivityAreaEntity> {
    try {
      // Get existing entity and merge with updates
      const existing = await this.getById(id);
      if (!existing) {
        throw new ActivityAreaDomainError(`Activity area with id ${id} not found`);
      }

      // Create updated entity and transform to backend format
      const updatedEntity = { ...existing, ...data } as ActivityAreaEntity;
      const backendData = ActivityAreaTransformer.toBackend(updatedEntity);
      
      // Call backend API
      const result = await this.httpClient.put<BackendPaginatedResponse<ActivityArea>>(`/activity-areas/${id}`, backendData);
      
      // Transform response back to domain entity  
      return ActivityAreaTransformer.toDomain(result.data[0]);
      
    } catch (error) {
      console.error('ActivityAreaRepositoryAdapter: Error in update:', error);
      throw new ActivityAreaDomainError(`Failed to update activity area ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.httpClient.delete(`/activity-areas/${id}`);
    } catch (error) {
      console.error('ActivityAreaRepositoryAdapter: Error in delete:', error);
      throw new ActivityAreaDomainError(`Failed to delete activity area ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Temporary factory function for legacy containers
export function createActivityAreaRepositoryAdapter(httpClient: HttpClient): IActivityAreaRepository {
  return new ActivityAreaRepositoryAdapter(httpClient);
}


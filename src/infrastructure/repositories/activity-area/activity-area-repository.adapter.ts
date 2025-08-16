import { ActivityAreaFilters, IActivityAreaRepository, PaginatedActivityAreas } from '@/entities/activity-area/infrastructure/actvity-area-repository.port';
import { executeWithDomainError } from './execute-with-domain-error.wrapper';

import { ActivityAreaEntity, ActivityAreaSearchCriteria, ActivityAreaDomainError } from '@/entities/activity-area/domain/ActivityAreaEntity';

import { ActivityAreaTransformer } from '@/infrastructure/transformers/ActivityAreaTransformer';

import { BackendPaginatedResponse } from '@/shared/api/backend-types';
import { ActivityArea } from '@/shared/api/domain-types';
import { IHttpClient } from '@/shared/api/types';

// Infrastructure: Adapter Pattern - Bridge existing API to domain interface
export class ActivityAreaRepositoryAdapter implements IActivityAreaRepository {
  constructor(private readonly httpClient: IHttpClient) { }


  async getAll(filters?: ActivityAreaFilters): Promise<PaginatedActivityAreas> {
    return executeWithDomainError(async () => {
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
    }, 'Failed to fetch activity areas');
  }

  async getById(id: number): Promise<ActivityAreaEntity | null> {
    return executeWithDomainError(async () => {
      const allEntitiesResult = await this.getAll();
      return allEntitiesResult.data.find(entity => entity.id === id) || null;
    }, `Failed to fetch activity area ${id}`);
  }

  async search(criteria: ActivityAreaSearchCriteria): Promise<ActivityAreaEntity[]> {
    return executeWithDomainError(async () => {
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
    }, 'Failed to search activity areas');
  }

  async create(data: Omit<ActivityAreaEntity, 'id'>): Promise<ActivityAreaEntity> {
    return executeWithDomainError(async () => {
      // Transform domain entity to backend format for API call
      const backendData = ActivityAreaTransformer.toBackend(data as ActivityAreaEntity);
      
      // Call backend API
      const result = await this.httpClient.post<BackendPaginatedResponse<ActivityArea>>('/activity-areas', backendData);
      
      // Transform response back to domain entity
      return ActivityAreaTransformer.toDomain(result.data[0]); // Assuming backend returns array with created item
    }, 'Failed to create activity area');
  }

  async update(id: number, data: Partial<ActivityAreaEntity>): Promise<ActivityAreaEntity> {
    return executeWithDomainError(async () => {
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
    }, `Failed to update activity area ${id}`);
  }

  async delete(id: number): Promise<void> {
    return executeWithDomainError(async () => {
      await this.httpClient.delete(`/activity-areas/${id}`);
    }, `Failed to delete activity area ${id}`);
  }
}
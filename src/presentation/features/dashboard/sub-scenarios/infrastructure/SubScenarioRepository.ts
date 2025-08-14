// Infrastructure: SubScenario Repository Adapter
import { SubScenarioEntity, SubScenarioSearchCriteria, SubScenarioDomainError } from '@/entities/sub-scenario/domain/SubScenarioEntity';
import { ISubScenarioRepository, PaginatedSubScenarios, SubScenariosFilters } from '../domain/repositories/ISubScenarioRepository';
import { HttpClient } from '@/shared/api/types';
import { BackendResponse, BackendPaginatedResponse } from '@/shared/api/backend-types';
import { SubScenarioTransformer, SubScenarioBackend } from '@/infrastructure/transformers/SubScenarioTransformer';

/**
 * Sub-Scenario Repository Implementation
 * 
 * Handles HTTP requests for sub-scenario operations.
 * Uses server-side HTTP client with authentication context.
 */
export class SubScenarioRepository implements ISubScenarioRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(filters?: SubScenariosFilters): Promise<PaginatedSubScenarios> {
    try {
      // Build query params from filters
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.scenarioId) params.append('scenarioId', filters.scenarioId.toString());
      if (filters?.activityAreaId) params.append('activityAreaId', filters.activityAreaId.toString());
      if (filters?.neighborhoodId) params.append('neighborhoodId', filters.neighborhoodId.toString());
      if (filters?.active !== undefined) params.append('active', filters.active.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      else params.append('limit', '1000'); // Default high limit

      // Call HTTP client with filters
      const result = await this.httpClient.get<BackendPaginatedResponse<SubScenarioBackend>>(
        `/sub-scenarios?${params.toString()}`
      );
      
      // Transform backend data to domain entities
      const transformedData = SubScenarioTransformer.toDomain(result.data) as SubScenarioEntity[];

      return {
        data: transformedData,
        meta: result.meta,
      };

    } catch (error) {
      console.error('SubScenarioRepository: Error in getAll:', error);
      throw new SubScenarioDomainError(`Failed to fetch sub-scenarios: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getById(id: number): Promise<SubScenarioEntity | null> {
    try {
      const result = await this.httpClient.get<SubScenarioBackend>(`/sub-scenarios/${id}`);
      
      // Transform backend data to domain entity
      return SubScenarioTransformer.toDomain(result) as SubScenarioEntity;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      console.error('SubScenarioRepository: Error in getById:', error);
      throw new SubScenarioDomainError(`Failed to fetch sub-scenario ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(criteria: SubScenarioSearchCriteria): Promise<SubScenarioEntity[]> {
    try {
      if (!criteria.isValid()) {
        throw new SubScenarioDomainError('Invalid search criteria');
      }

      const allEntities = await this.getAll();
      
      let filtered = allEntities;

      // Filter by search query
      if (criteria.searchQuery) {
        filtered = filtered.filter(entity => 
          entity.matchesSearchQuery(criteria.searchQuery!)
        );
      }

      // Filter by scenario ID
      if (criteria.scenarioId) {
        filtered = filtered.filter(entity => 
          entity.belongsToScenario(criteria.scenarioId!)
        );
      }

      // Filter by activity area ID
      if (criteria.activityAreaId) {
        filtered = filtered.filter(entity => 
          entity.belongsToActivityArea(criteria.activityAreaId!)
        );
      }

      // Filter by field surface type ID
      if (criteria.fieldSurfaceTypeId) {
        filtered = filtered.filter(entity => 
          entity.hasFieldSurfaceType(criteria.fieldSurfaceTypeId!)
        );
      }

      // Filter by cost
      if (criteria.hasCost !== undefined) {
        filtered = filtered.filter(entity => 
          entity.hasCost === criteria.hasCost
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
      console.error('SubScenarioRepository: Error in search:', error);
      throw error;
    }
  }

  /**
   * Create a new sub-scenario
   */
  async create(data: Omit<SubScenarioEntity, "id"> & { images?: any[] }): Promise<SubScenarioEntity> {
    try {
      // Extract images from data as they should be handled separately
      const { images, ...subScenarioData } = data;
      
      // Transform domain entity to backend format for API call
      const backendData = SubScenarioTransformer.toBackend(subScenarioData as SubScenarioEntity);
      
      // Call backend API
      const result = await this.httpClient.post<BackendResponse<SubScenarioBackend>>('/sub-scenarios', backendData);
      
      // Transform response back to domain entity
      return SubScenarioTransformer.toDomain(result.data) as SubScenarioEntity;
      
    } catch (error) {
      console.error('SubScenarioRepository: Error in create:', error);
      throw new SubScenarioDomainError(`Failed to create sub-scenario: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing sub-scenario
   */
  async update(id: number, data: Partial<SubScenarioEntity>): Promise<SubScenarioEntity> {
    try {
      // Get existing entity and merge with updates
      const existing = await this.getById(id);
      if (!existing) {
        throw new SubScenarioDomainError(`Sub-scenario with id ${id} not found`);
      }

      // Create updated entity and transform to backend format
      const updatedEntity = { ...existing, ...data } as SubScenarioEntity;
      const backendData = SubScenarioTransformer.toBackend(updatedEntity);
      
      // Call backend API
      const result = await this.httpClient.put<BackendResponse<SubScenarioBackend>>(`/sub-scenarios/${id}`, backendData);
      
      // Transform response back to domain entity  
      return SubScenarioTransformer.toDomain(result.data) as SubScenarioEntity;
      
    } catch (error) {
      console.error('SubScenarioRepository: Error in update:', error);
      throw new SubScenarioDomainError(`Failed to update sub-scenario ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.httpClient.delete(`/sub-scenarios/${id}`);
    } catch (error) {
      console.error('SubScenarioRepository: Error in delete:', error);
      throw new SubScenarioDomainError(`Failed to delete sub-scenario ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Temporary factory function for legacy containers
export function createSubScenarioRepositoryAdapter(httpClient: HttpClient): ISubScenarioRepository {
  return new SubScenarioRepository(httpClient);
}
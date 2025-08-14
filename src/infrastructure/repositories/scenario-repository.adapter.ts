// Infrastructure: Scenario Repository Adapter
import { ScenarioEntity, ScenarioSearchCriteria, ScenarioDomainError } from '@/entities/scenario/domain/ScenarioEntity';
import { IScenarioRepository, PaginatedScenarios, ScenarioFilters } from '@/entities/scenario/infrastructure/IScenarioRepository';
import { HttpClient } from '@/shared/api/types';
import { BackendResponse, BackendPaginatedResponse } from '@/shared/api/backend-types';
import { ScenarioTransformer, ScenarioBackend } from '@/infrastructure/transformers/ScenarioTransformer';

export class ScenarioRepository implements IScenarioRepository {
  constructor(private readonly httpClient: HttpClient) {}
  
  async getAll(filters?: ScenarioFilters): Promise<PaginatedScenarios> {
    try {
      // Build query params from filters
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.neighborhoodId) params.append('neighborhoodId', filters.neighborhoodId.toString());
      if (filters?.active !== undefined) params.append('active', filters.active.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      else params.append('limit', '1000'); // Default high limit

      // Call HTTP client with filters
      const result = await this.httpClient.get<BackendPaginatedResponse<ScenarioBackend>>(
        `/scenarios?${params.toString()}`
      );
      
      // Transform backend data to domain entities
      const transformedData = ScenarioTransformer.toDomain(result.data) as ScenarioEntity[];

      return {
        data: transformedData,
        meta: result.meta,
      };

    } catch (error) {
      console.error('ScenarioRepository: Error in getAll:', error);
      throw new ScenarioDomainError(`Failed to fetch scenarios: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getById(id: number): Promise<ScenarioEntity | null> {
    try {
      const result = await this.httpClient.get<ScenarioBackend>(`/scenarios/${id}`);
      
      // Transform backend data to domain entity
      return ScenarioTransformer.toDomain(result) as ScenarioEntity;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      console.error('ScenarioRepository: Error in getById:', error);
      throw new ScenarioDomainError(`Failed to fetch scenario ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(criteria: ScenarioSearchCriteria): Promise<ScenarioEntity[]> {
    try {
      if (!criteria.isValid()) {
        throw new ScenarioDomainError('Invalid search criteria');
      }

      const allScenariosResult = await this.getAll();
      
      let filtered = allScenariosResult.data;

      // Filter by search query
      if (criteria.searchQuery) {
        filtered = filtered.filter(entity => 
          entity.matchesSearchQuery(criteria.searchQuery!)
        );
      }

      // Filter by neighborhood ID
      if (criteria.neighborhoodId) {
        filtered = filtered.filter(entity => 
          entity.isInNeighborhood(criteria.neighborhoodId!)
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
      console.error('ScenarioRepository: Error in search:', error);
      throw error;
    }
  }

  async create(data: Omit<ScenarioEntity, 'id'>): Promise<ScenarioEntity> {
    try {
      // Transform domain entity to backend format for API call
      const backendData = ScenarioTransformer.toBackend(data as ScenarioEntity);
      
      // Call backend API
      const result = await this.httpClient.post<BackendResponse<ScenarioBackend>>('/scenarios', backendData);
      
      // Transform response back to domain entity
      return ScenarioTransformer.toDomain(result.data) as ScenarioEntity;
      
    } catch (error) {
      console.error('ScenarioRepository: Error in create:', error);
      throw new ScenarioDomainError(`Failed to create scenario: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(id: number, data: Partial<ScenarioEntity>): Promise<ScenarioEntity> {
    try {
      // Get existing entity and merge with updates
      const existing = await this.getById(id);
      if (!existing) {
        throw new ScenarioDomainError(`Scenario with id ${id} not found`);
      }

      // Create updated entity and transform to backend format
      const updatedEntity = { ...existing, ...data } as ScenarioEntity;
      const backendData = ScenarioTransformer.toBackend(updatedEntity);
      
      // Call backend API
      const result = await this.httpClient.put<BackendResponse<ScenarioBackend>>(`/scenarios/${id}`, backendData);
      
      // Transform response back to domain entity  
      return ScenarioTransformer.toDomain(result.data) as ScenarioEntity;
      
    } catch (error) {
      console.error('ScenarioRepository: Error in update:', error);
      throw new ScenarioDomainError(`Failed to update scenario ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.httpClient.delete(`/scenarios/${id}`);
    } catch (error) {
      console.error('ScenarioRepository: Error in delete:', error);
      throw new ScenarioDomainError(`Failed to delete scenario ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Temporary factory function for legacy containers
export function createScenarioRepositoryAdapter(httpClient: HttpClient): IScenarioRepository {
  return new ScenarioRepository(httpClient);
}

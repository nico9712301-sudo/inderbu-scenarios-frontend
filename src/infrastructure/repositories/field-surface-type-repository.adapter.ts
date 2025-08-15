// Infrastructure: Field Surface Type Repository Adapter
import { IFieldSurfaceTypeRepository, PaginatedFieldSurfaceTypes, FieldSurfaceTypeFilters } from '@/entities/field-surface-type/domain/IFieldSurfaceTypeRepository';
import { FieldSurfaceTypeEntity, FieldSurfaceTypeSearchCriteria, FieldSurfaceTypeDomainError } from '@/entities/field-surface-type/domain/FieldSurfaceTypeEntity';
import { FieldSurfaceType } from '@/shared/api/domain-types';
import { HttpClient } from '@/shared/api/types';
import { BackendPaginatedResponse } from '@/shared/api/backend-types';
import { FieldSurfaceTypeTransformer } from '@/infrastructure/transformers/FieldSurfaceTypeTransformer';

export class FieldSurfaceTypeRepositoryAdapter implements IFieldSurfaceTypeRepository {
  constructor(private readonly httpClient: HttpClient) { }

  async getAll(filters?: FieldSurfaceTypeFilters): Promise<PaginatedFieldSurfaceTypes> {
    try {
      // Build query params from filters
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.active !== undefined) params.append('active', filters.active.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      else params.append('limit', '1000'); // Default high limit

      // Call HTTP client - backend returns BackendPaginatedResponse
      const result = await this.httpClient.get<BackendPaginatedResponse<FieldSurfaceType>>(
        `/field-surface-types?${params.toString()}`
      );
      
      // Transform backend data to domain entities
      const transformedData: FieldSurfaceTypeEntity[] = result.data.map(fieldSurfaceTypeData => 
        FieldSurfaceTypeTransformer.toDomain(fieldSurfaceTypeData)
      );

      return {
        data: transformedData,
        meta: result.meta,
      };

    } catch (error) {
      console.error('FieldSurfaceTypeRepositoryAdapter: Error in getAll:', error);
      throw new FieldSurfaceTypeDomainError(`Failed to fetch field surface types: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getById(id: number): Promise<FieldSurfaceTypeEntity | null> {
    try {
      const allEntitiesResult = await this.getAll();
      return allEntitiesResult.data.find(entity => entity.id === id) || null;
    } catch (error) {
      console.error('FieldSurfaceTypeRepositoryAdapter: Error in getById:', error);
      throw error;
    }
  }

  async search(criteria: FieldSurfaceTypeSearchCriteria): Promise<FieldSurfaceTypeEntity[]> {
    try {
      if (!criteria.isValid()) {
        throw new FieldSurfaceTypeDomainError('Invalid search criteria');
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
      console.error('FieldSurfaceTypeRepositoryAdapter: Error in search:', error);
      throw error;
    }
  }

  async create(data: Omit<FieldSurfaceTypeEntity, 'id'>): Promise<FieldSurfaceTypeEntity> {
    try {
      // Transform domain entity to backend format for API call
      const backendData = FieldSurfaceTypeTransformer.toBackend(data as FieldSurfaceTypeEntity);
      
      // Call backend API
      const result = await this.httpClient.post<BackendPaginatedResponse<FieldSurfaceType>>('/field-surface-types', backendData);
      
      // Transform response back to domain entity
      return FieldSurfaceTypeTransformer.toDomain(result.data[0]);
      
    } catch (error) {
      console.error('FieldSurfaceTypeRepositoryAdapter: Error in create:', error);
      throw new FieldSurfaceTypeDomainError(`Failed to create field surface type: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(id: number, data: Partial<FieldSurfaceTypeEntity>): Promise<FieldSurfaceTypeEntity> {
    try {
      // Get existing entity and merge with updates
      const existing = await this.getById(id);
      if (!existing) {
        throw new FieldSurfaceTypeDomainError(`Field surface type with id ${id} not found`);
      }

      // Create updated entity and transform to backend format
      const updatedEntity = { ...existing, ...data } as FieldSurfaceTypeEntity;
      const backendData = FieldSurfaceTypeTransformer.toBackend(updatedEntity);
      
      // Call backend API
      const result = await this.httpClient.put<BackendPaginatedResponse<FieldSurfaceType>>(`/field-surface-types/${id}`, backendData);
      
      // Transform response back to domain entity  
      return FieldSurfaceTypeTransformer.toDomain(result.data[0]);
      
    } catch (error) {
      console.error('FieldSurfaceTypeRepositoryAdapter: Error in update:', error);
      throw new FieldSurfaceTypeDomainError(`Failed to update field surface type ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.httpClient.delete(`/field-surface-types/${id}`);
    } catch (error) {
      console.error('FieldSurfaceTypeRepositoryAdapter: Error in delete:', error);
      throw new FieldSurfaceTypeDomainError(`Failed to delete field surface type ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Temporary factory function for legacy containers
export function createFieldSurfaceTypeRepositoryAdapter(httpClient: HttpClient): IFieldSurfaceTypeRepository {
  return new FieldSurfaceTypeRepositoryAdapter(httpClient);
}
import { INeighborhoodRepository, PaginatedNeighborhoods, NeighborhoodFilters } from '@/entities/neighborhood/infrastructure/INeighborhoodRepository';
import { NeighborhoodEntity, NeighborhoodSearchCriteria, NeighborhoodDomainError } from '@/entities/neighborhood/domain/NeighborhoodEntity';
import { NeighborhoodTransformer } from '@/infrastructure/transformers/NeighborhoodTransformer';
import { BackendPaginatedResponse } from '@/shared/api/backend-types';
import { HttpClient } from '@/shared/api/types';
import { Neighborhood } from '@/shared/api/domain-types';
// Infrastructure: Neighborhood Repository Adapter

export class NeighborhoodRepositoryAdapter implements INeighborhoodRepository {
  constructor(private readonly httpClient: HttpClient) { }

  async getAll(filters?: NeighborhoodFilters): Promise<PaginatedNeighborhoods> {
    try {
      // Build query params from filters
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.communeId) params.append('communeId', filters.communeId.toString());
      if (filters?.active !== undefined) params.append('active', filters.active.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      else params.append('limit', '1000'); // Default high limit

      // Call HTTP client - backend returns BackendPaginatedResponse
      const result = await this.httpClient.get<BackendPaginatedResponse<Neighborhood>>(
        `/neighborhoods?${params.toString()}`
      );
      
      // Transform backend data to domain entities
      const transformedData: NeighborhoodEntity[] = result.data.map(neighborhoodData => 
        NeighborhoodTransformer.toDomain(neighborhoodData)
      );

      return {
        data: transformedData,
        meta: result.meta,
      };

    } catch (error) {
      console.error('NeighborhoodRepositoryAdapter: Error in getAll:', error);
      throw new NeighborhoodDomainError(`Failed to fetch neighborhoods: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getById(id: number): Promise<NeighborhoodEntity | null> {
    try {
      const allEntitiesResult = await this.getAll();
      return allEntitiesResult.data.find(entity => entity.id === id) || null;
    } catch (error) {
      console.error('NeighborhoodRepositoryAdapter: Error in getById:', error);
      throw error;
    }
  }

  async search(criteria: NeighborhoodSearchCriteria): Promise<NeighborhoodEntity[]> {
    try {
      if (!criteria.isValid()) {
        throw new NeighborhoodDomainError('Invalid search criteria');
      }

      const allEntitiesResult = await this.getAll();
      
      let filtered = allEntitiesResult.data;

      // Filter by search query
      if (criteria.searchQuery) {
        filtered = filtered.filter(entity => 
          entity.matchesSearchQuery(criteria.searchQuery!)
        );
      }

      // Filter by commune ID
      if (criteria.communeId) {
        filtered = filtered.filter(entity => 
          entity.communeId === criteria.communeId
        );
      }

      // Filter by city ID
      if (criteria.cityId) {
        filtered = filtered.filter(entity => 
          entity.cityId === criteria.cityId
        );
      }

      // Apply limit
      if (criteria.limit && criteria.limit > 0) {
        filtered = filtered.slice(0, criteria.limit);
      }

      return filtered;

    } catch (error) {
      console.error('NeighborhoodRepositoryAdapter: Error in search:', error);
      throw error;
    }
  }

  async findByCommuneId(communeId: number): Promise<NeighborhoodEntity[]> {
    try {
      const allEntitiesResult = await this.getAll();
      return allEntitiesResult.data.filter(entity => entity.communeId === communeId);
    } catch (error) {
      console.error('NeighborhoodRepositoryAdapter: Error in findByCommuneId:', error);
      throw error;
    }
  }

  async create(data: Omit<NeighborhoodEntity, 'id'>): Promise<NeighborhoodEntity> {
    try {
      // Transform domain entity to backend format for API call
      const backendData = NeighborhoodTransformer.toBackend(data as NeighborhoodEntity);
      
      // Call backend API
      const result = await this.httpClient.post<BackendPaginatedResponse<Neighborhood>>('/neighborhoods', backendData);
      
      // Transform response back to domain entity
      return NeighborhoodTransformer.toDomain(result.data[0]);
      
    } catch (error) {
      console.error('NeighborhoodRepositoryAdapter: Error in create:', error);
      throw new NeighborhoodDomainError(`Failed to create neighborhood: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(id: number, data: Partial<NeighborhoodEntity>): Promise<NeighborhoodEntity> {
    try {
      // Get existing entity and merge with updates
      const existing = await this.getById(id);
      if (!existing) {
        throw new NeighborhoodDomainError(`Neighborhood with id ${id} not found`);
      }

      // Create updated entity and transform to backend format
      const updatedEntity = { ...existing, ...data } as NeighborhoodEntity;
      const backendData = NeighborhoodTransformer.toBackend(updatedEntity);
      
      // Call backend API
      const result = await this.httpClient.put<BackendPaginatedResponse<Neighborhood>>(`/neighborhoods/${id}`, backendData);
      
      // Transform response back to domain entity  
      return NeighborhoodTransformer.toDomain(result.data[0]);
      
    } catch (error) {
      console.error('NeighborhoodRepositoryAdapter: Error in update:', error);
      throw new NeighborhoodDomainError(`Failed to update neighborhood ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.httpClient.delete(`/neighborhoods/${id}`);
    } catch (error) {
      console.error('NeighborhoodRepositoryAdapter: Error in delete:', error);
      throw new NeighborhoodDomainError(`Failed to delete neighborhood ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Temporary factory function for legacy containers
export function createNeighborhoodRepositoryAdapter(httpClient: HttpClient): INeighborhoodRepository {
  return new NeighborhoodRepositoryAdapter(httpClient);
}
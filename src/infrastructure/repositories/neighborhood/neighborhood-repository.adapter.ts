import { INeighborhoodRepository, PaginatedNeighborhoods, NeighborhoodFilters } from '@/entities/neighborhood/infrastructure/INeighborhoodRepository';
import { NeighborhoodEntity, NeighborhoodSearchCriteria, NeighborhoodDomainError } from '@/entities/neighborhood/domain/NeighborhoodEntity';
import { NeighborhoodTransformer } from '@/infrastructure/transformers/NeighborhoodTransformer';
import { BackendPaginatedResponse } from '@/shared/api/backend-types';
import { IHttpClient } from '@/shared/api/types';
import { Neighborhood } from '@/shared/api/domain-types';
import { executeWithDomainError } from './execute-with-domain-error.wrapper';
// Infrastructure: Neighborhood Repository Adapter

export class NeighborhoodRepositoryAdapter implements INeighborhoodRepository {
  constructor(private readonly httpClient: IHttpClient) { }

  async getAll(filters?: NeighborhoodFilters): Promise<PaginatedNeighborhoods> {
    return executeWithDomainError(async () => {
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
    }, 'Failed to fetch neighborhoods');
  }

  async getById(id: number): Promise<NeighborhoodEntity | null> {
    return executeWithDomainError(async () => {
      const allEntitiesResult = await this.getAll();
      return allEntitiesResult.data.find(entity => entity.id === id) || null;
    }, `Failed to fetch neighborhood ${id}`);
  }

  async create(data: Omit<NeighborhoodEntity, 'id'>): Promise<NeighborhoodEntity> {
    return executeWithDomainError(async () => {
      // Transform domain entity to backend format for API call
      const backendData = NeighborhoodTransformer.toBackend(data as NeighborhoodEntity);
      
      // Call backend API
      const result = await this.httpClient.post<BackendPaginatedResponse<Neighborhood>>('/neighborhoods', backendData);
      
      // Transform response back to domain entity
      return NeighborhoodTransformer.toDomain(result.data[0]);
    }, 'Failed to create neighborhood');
  }

  async update(id: number, data: Partial<NeighborhoodEntity>): Promise<NeighborhoodEntity> {
    return executeWithDomainError(async () => {
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
    }, `Failed to update neighborhood ${id}`);
  }

  async delete(id: number): Promise<void> {
    return executeWithDomainError(async () => {
      await this.httpClient.delete(`/neighborhoods/${id}`);
    }, `Failed to delete neighborhood ${id}`);
  }
}
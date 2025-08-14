import { PaginatedSubScenarios } from '@/entities/sub-scenario/domain/sub-scenario.domain';
import { SubScenarioEntity } from '@/entities/sub-scenario/domain/SubScenarioEntity';
import { ISubScenarioRepository, SubScenariosFilters } from '@/entities/sub-scenario/infrastructure/ISubScenarioRepository';
import { SubScenarioTransformer, SubScenarioBackend } from '@/infrastructure/transformers/SubScenarioTransformer';
import { IHttpClient } from '@/shared/api/http-client-server';
import { BackendPaginatedResponse } from '@/shared/api/backend-types';

export class SubScenarioRepository implements ISubScenarioRepository {
  constructor(private readonly httpClient: IHttpClient) {}
  
  async getAll(filters: SubScenariosFilters): Promise<PaginatedSubScenarios> {
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.scenarioId) params.append('scenarioId', filters.scenarioId.toString());
      if (filters.activityAreaId) params.append('activityAreaId', filters.activityAreaId.toString());
      if (filters.neighborhoodId) params.append('neighborhoodId', filters.neighborhoodId.toString());
      if (filters.active !== undefined) params.append('active', filters.active.toString());

      // Call HTTP client - backend returns BackendPaginatedResponse
      const result = await this.httpClient.get<BackendPaginatedResponse<SubScenarioBackend>>(
        `/sub-scenarios?${params.toString()}`
      );

      // Transform backend data to domain entities
      const transformedData: SubScenarioEntity[] = result.data.map(subScenarioData => 
        SubScenarioTransformer.toDomain(subScenarioData)
      );

      return {
        data: transformedData,
        meta: result.meta,
      };
    } catch (error) {
      console.error('Error in SubScenarioRepository.getAll:', error);
      throw error;
    }
  }

  async create(data: Omit<SubScenarioEntity, "id"> & { images?: any[] }): Promise<SubScenarioEntity> {
    try {
      // Transform domain entity to backend format for API call
      const backendData = SubScenarioTransformer.toBackend(data as SubScenarioEntity);
      
      // Direct API call - simple backend response
      const result = await this.httpClient.post<SubScenarioBackend>('/sub-scenarios', backendData);
      
      // Transform backend data to domain entity
      return SubScenarioTransformer.toDomain(result);
    } catch (error) {
      console.error('Error in SubScenarioRepository.create:', error);
      throw error;
    }
  }

  async update(id: number, data: Partial<SubScenarioEntity>): Promise<SubScenarioEntity> {
    try {
      // Transform domain entity to backend format for API call
      const backendData = SubScenarioTransformer.toBackend(data as SubScenarioEntity);
      
      // Direct API call - simple backend response
      const result = await this.httpClient.put<SubScenarioBackend>(`/sub-scenarios/${id}`, backendData);
      
      // Transform backend data to domain entity
      return SubScenarioTransformer.toDomain(result);
    } catch (error) {
      console.error('Error in SubScenarioRepository.update:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<SubScenarioEntity | null> {
    try {
      // Input validation
      if (id <= 0) {
        throw new Error('Sub-scenario ID must be a positive number');
      }

      // Direct API call - simple backend response
      const result = await this.httpClient.get<SubScenarioBackend>(`/sub-scenarios/${id}`);
      
      // Transform backend data to domain entity
      return SubScenarioTransformer.toDomain(result);

    } catch (error: any) {
      if (error?.status === 404) {
        return null;
      }
      console.error(`Error in SubScenarioRepository.getById for ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      // Input validation
      if (id <= 0) {
        throw new Error('Sub-scenario ID must be a positive number');
      }

      // Make API request (soft delete - set isActive to false)
      await this.httpClient.delete(`/sub-scenarios/${id}`);

    } catch (error) {
      console.error(`Error in SubScenarioRepository.delete for ID ${id}:`, error);
      throw error;
    }
  }
}
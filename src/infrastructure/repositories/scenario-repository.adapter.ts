import { Scenario, CreateScenarioData, UpdateScenarioData } from '@/entities/scenario/domain/Scenario';
import { IScenarioRepository, PaginatedScenarios, ScenarioFilters } from '@/entities/scenario/infrastructure/IScenarioRepository';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';
import { BackendResponse } from '@/shared/api/backend-types';

export class ScenarioRepository implements IScenarioRepository {
  
  async findAll(): Promise<Scenario[]> {
    try {
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      const result = await httpClient.get<{ data: Scenario[] } | Scenario[]>('/scenarios/all');
      return Array.isArray(result) ? result : result.data;
    } catch (error) {
      console.error('Error in ScenarioRepository.findAll:', error);
      throw error;
    }
  }

  async findWithPagination(filters: ScenarioFilters): Promise<PaginatedScenarios> {
    try {
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Build query params
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.neighborhoodId) params.append('neighborhoodId', filters.neighborhoodId.toString());
      if (filters.active !== undefined) params.append('active', filters.active.toString());

      const result = await httpClient.get<PaginatedScenarios>(
        `/scenarios?${params.toString()}`
      );

      return result;
    } catch (error) {
      console.error('Error in ScenarioRepository.findWithPagination:', error);
      throw error;
    }
  }

  async findById(id: number): Promise<Scenario | null> {
    try {
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      const result = await httpClient.get<Scenario>(`/scenarios/${id}`);
      return result;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      console.error('Error in ScenarioRepository.findById:', error);
      throw error;
    }
  }

  async create(data: CreateScenarioData): Promise<Scenario> {
    try {
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Map domain data to API format
      const createPayload = {
        name: data.name,
        address: data.address,
        neighborhoodId: data.neighborhoodId,
        ...(data.description && { description: data.description }),
      };

      const result = await httpClient.post<BackendResponse<Scenario>>('/scenarios', createPayload);
      
      // Unwrap backend response to get the actual Scenario
      console.log('Repository: Backend response:', result);
      console.log('Repository: Unwrapped scenario:', result.data);
      
      return result.data;
    } catch (error) {
      console.error('Error in ScenarioRepository.create:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateScenarioData): Promise<Scenario> {
    try {
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Map domain data to API format
      const updatePayload = {
        ...(data.name && { name: data.name }),
        ...(data.address && { address: data.address }),
        ...(data.neighborhoodId && { neighborhoodId: data.neighborhoodId }),
        ...(data.active !== undefined && { isActive: data.active }),
      };

      const result = await httpClient.put<BackendResponse<Scenario>>(`/scenarios/${id}`, updatePayload);
      
      // Unwrap backend response to get the actual Scenario  
      console.log('Repository: Update backend response:', result);
      console.log('Repository: Unwrapped updated scenario:', result.data);
      
      return result.data;
    } catch (error) {
      console.error('Error in ScenarioRepository.update:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      await httpClient.delete(`/scenarios/${id}`);
    } catch (error) {
      console.error('Error in ScenarioRepository.delete:', error);
      throw error;
    }
  }

  async getAllWithLimit(limit: number): Promise<Scenario[]> {
    try {
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      const params = new URLSearchParams();
      params.append('limit', limit.toString());

      const result = await httpClient.get<{ data: Scenario[] } | Scenario[]>(
        `/scenarios?${params.toString()}`
      );
      
      return Array.isArray(result) ? result : result.data;
    } catch (error) {
      console.error('Error in ScenarioRepository.getAllWithLimit:', error);
      throw error;
    }
  }
}

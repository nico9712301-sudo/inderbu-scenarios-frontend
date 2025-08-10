import {
  SubScenario,
  Scenario,
  ActivityArea,
  Neighborhood,
} from '@/services/api';
import {
  ISubScenarioRepository,
  IScenarioRepository,
  IActivityAreaRepository,
  INeighborhoodRepository,
  PaginatedSubScenarios,
  SubScenariosFilters,
} from '../domain/repositories/ISubScenarioRepository';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';

export class SubScenarioRepository implements ISubScenarioRepository {
  
  async getAllWithPagination(filters: SubScenariosFilters): Promise<PaginatedSubScenarios> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Build query params
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.scenarioId) params.append('scenarioId', filters.scenarioId.toString());
      if (filters.activityAreaId) params.append('activityAreaId', filters.activityAreaId.toString());
      if (filters.neighborhoodId) params.append('neighborhoodId', filters.neighborhoodId.toString());
      if (filters.active !== undefined) params.append('active', filters.active.toString());

      // Direct API call with authentication
      const result: PaginatedSubScenarios = await httpClient.get<PaginatedSubScenarios>(
        `/sub-scenarios?${params.toString()}`
      );

      return result;
    } catch (error) {
      console.error('Error in SubScenarioRepository.getAllWithPagination:', error);
      throw error;
    }
  }

  async create(data: Omit<SubScenario, "id"> & { images?: any[] }): Promise<SubScenario> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const created = await httpClient.post<SubScenario>('/sub-scenarios', data);
      
      // Handle image uploads if provided
      if (data.images?.length) {
        const fd = new FormData();
        data.images.forEach((img) => {
          fd.append("files", img.url!);
          fd.append("isFeature", img.isFeature ? "true" : "false");
        });
        
        // Note: FormData uploads might need different handling
        // For now, we'll keep the fetch approach for file uploads
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sub-scenarios/${created.id}/images`,
          { 
            method: "POST", 
            body: fd,
            credentials: 'include' // Include cookies for auth
          }
        );
      }
      
      return created;
    } catch (error) {
      console.error('Error in SubScenarioRepository.create:', error);
      throw error;
    }
  }

  async update(id: number, data: Partial<SubScenario>): Promise<SubScenario> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const result = await httpClient.put<SubScenario>(`/sub-scenarios/${id}`, data);
      return result;
    } catch (error) {
      console.error('Error in SubScenarioRepository.update:', error);
      throw error;
    }
  }
}

export class ScenarioRepository implements IScenarioRepository {
  
  async getAllWithLimit(limit: number): Promise<Scenario[]> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const result = await httpClient.get<{ data: Scenario[] }>(`/scenarios?limit=${limit}`);
      return result.data;
    } catch (error) {
      console.error('Error in ScenarioRepository.getAllWithLimit:', error);
      throw error;
    }
  }
}

export class ActivityAreaRepository implements IActivityAreaRepository {
  
  async getAll(): Promise<ActivityArea[]> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const result = await httpClient.get<{ data: ActivityArea[] } | ActivityArea[]>('/activity-areas');
      
      // Handle both array and paginated responses
      return Array.isArray(result) ? result : result.data;
    } catch (error) {
      console.error('Error in ActivityAreaRepository.getAll:', error);
      throw error;
    }
  }
}

export class NeighborhoodRepository implements INeighborhoodRepository {
  
  async getAll(): Promise<Neighborhood[]> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const result = await httpClient.get<{ data: Neighborhood[] } | Neighborhood[]>('/neighborhoods');
      
      // Handle both array and paginated responses
      return Array.isArray(result) ? result : result.data;
    } catch (error) {
      console.error('Error in NeighborhoodRepository.getAll:', error);
      throw error;
    }
  }
}

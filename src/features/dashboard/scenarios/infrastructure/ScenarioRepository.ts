import { 
  scenarioService, 
  neighborhoodService, 
  Scenario, 
  Neighborhood, 
  CreateScenarioDto, 
  UpdateScenarioDto 
} from '@/services/api';
import { 
  IScenarioRepository, 
  INeighborhoodRepository,
  PaginatedScenarios, 
  IScenariosFilters 
} from '../domain/repositories/IScenarioRepository';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';

export class ScenarioRepository implements IScenarioRepository {
  
  async getAllWithPagination(filters: IScenariosFilters): Promise<PaginatedScenarios> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Build query params
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.neighborhoodId) params.append('neighborhoodId', filters.neighborhoodId.toString());

      // Direct API call with authentication
      const result = await httpClient.get<PaginatedScenarios>(
        `/scenarios?${params.toString()}`
      );

      return result;
    } catch (error) {
      console.error('Error in ScenarioRepository.getAllWithPagination:', error);
      throw error;
    }
  }

  async create(data: CreateScenarioDto): Promise<Scenario> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const result = await httpClient.post<Scenario>('/scenarios', data);
      return result;
    } catch (error) {
      console.error('Error in ScenarioRepository.create:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateScenarioDto): Promise<Scenario> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const result = await httpClient.put<Scenario>(`/scenarios/${id}`, data);
      return result;
    } catch (error) {
      console.error('Error in ScenarioRepository.update:', error);
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

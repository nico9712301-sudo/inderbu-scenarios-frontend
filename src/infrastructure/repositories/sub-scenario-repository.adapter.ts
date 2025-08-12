import { PaginatedSubScenarios } from '@/entities/sub-scenario/domain/sub-scenario.domain';
import { ISubScenarioRepository, SubScenariosFilters } from '@/presentation/features/dashboard/sub-scenarios/domain/repositories/ISubScenarioRepository';
import {
  SubScenario,
} from '@/services/api';
import { ClientHttpClient, ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext, ServerAuthContext } from '@/shared/api/server-auth';

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
      const authContext: ServerAuthContext = createServerAuthContext();
      const httpClient: ClientHttpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const created = await httpClient.post<SubScenario>('/sub-scenarios', data);
      
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
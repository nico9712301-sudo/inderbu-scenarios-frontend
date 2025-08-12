import { SubScenario } from '@/services/api';
import { ISubScenarioRepository, PaginatedSubScenarios, SubScenariosFilters } from '../domain/repositories/ISubScenarioRepository';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';

/**
 * Sub-Scenario Repository Implementation
 * 
 * Handles HTTP requests for sub-scenario operations.
 * Uses server-side HTTP client with authentication context.
 */
export class SubScenarioRepository implements ISubScenarioRepository {
  private httpClient: ReturnType<typeof ClientHttpClientFactory.createClient>;

  constructor() {
    // Create HTTP client with server authentication context
    const authContext = createServerAuthContext();
    this.httpClient = ClientHttpClientFactory.createClient(authContext);
  }

  /**
   * Get all sub-scenarios with pagination and filtering
   */
  async getAllWithPagination(filters: SubScenariosFilters): Promise<PaginatedSubScenarios> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query parameters
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.scenarioId) queryParams.append('scenarioId', filters.scenarioId.toString());
      if (filters.activityAreaId) queryParams.append('activityAreaId', filters.activityAreaId.toString());
      if (filters.neighborhoodId) queryParams.append('neighborhoodId', filters.neighborhoodId.toString());
      if (filters.active !== undefined) queryParams.append('active', filters.active.toString());

      const response = await this.httpClient.get<PaginatedSubScenarios>(
        `/sub-scenarios?${queryParams.toString()}`
      );

      return response;
    } catch (error) {
      console.error('Error fetching sub-scenarios:', error);
      throw error;
    }
  }

  /**
   * Create a new sub-scenario
   */
  async create(data: Omit<SubScenario, "id"> & { images?: any[] }): Promise<SubScenario> {
    try {
      // Extract images from data as they should be handled separately
      const { images, ...subScenarioData } = data;
      
      const response = await this.httpClient.post<SubScenario>(
        '/sub-scenarios',
        subScenarioData
      );

      return response;
    } catch (error) {
      console.error('Error creating sub-scenario:', error);
      throw error;
    }
  }

  /**
   * Update an existing sub-scenario
   */
  async update(id: number, data: Partial<SubScenario>): Promise<SubScenario> {
    try {
      const response = await this.httpClient.put<SubScenario>(
        `/sub-scenarios/${id}`,
        data
      );

      return response;
    } catch (error) {
      console.error('Error updating sub-scenario:', error);
      throw error;
    }
  }
}
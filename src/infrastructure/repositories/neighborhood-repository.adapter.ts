import { injectable } from 'inversify';
import { 
  INeighborhoodRepository, 
  NeighborhoodFilters 
} from '@/entities/neighborhood/infrastructure/INeighborhoodRepository';
import { Neighborhood, CreateNeighborhoodData, UpdateNeighborhoodData } from '@/entities/neighborhood/domain/Neighborhood';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';

@injectable()
export class NeighborhoodRepository implements INeighborhoodRepository {
  
  async findAll(filters: NeighborhoodFilters = {}): Promise<Neighborhood[]> {
    try {
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Build query params
      const params = new URLSearchParams();
      if (filters.communeId) params.append('communeId', filters.communeId.toString());
      if (filters.search) params.append('search', filters.search);

      const queryString = params.toString();
      const endpoint = queryString ? `/neighborhoods?${queryString}` : '/neighborhoods';

      const result = await httpClient.get<{ data: Neighborhood[] } | Neighborhood[]>(endpoint);
      return Array.isArray(result) ? result : result.data;
    } catch (error) {
      console.error('Error in NeighborhoodRepository.findAll:', error);
      throw error;
    }
  }

  async findById(id: number): Promise<Neighborhood | null> {
    try {
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      const result = await httpClient.get<Neighborhood>(`/neighborhoods/${id}`);
      return result;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      console.error('Error in NeighborhoodRepository.findById:', error);
      throw error;
    }
  }

  async findByCommuneId(communeId: number): Promise<Neighborhood[]> {
    return await this.findAll({ communeId });
  }

  async create(data: CreateNeighborhoodData): Promise<Neighborhood> {
    try {
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Map domain data to API format
      const createPayload = {
        name: data.name,
        communeId: data.communeId,
      };

      const result = await httpClient.post<Neighborhood>('/neighborhoods', createPayload);
      return result;
    } catch (error) {
      console.error('Error in NeighborhoodRepository.create:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateNeighborhoodData): Promise<Neighborhood> {
    try {
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Map domain data to API format
      const updatePayload = {
        ...(data.name && { name: data.name }),
        ...(data.communeId && { communeId: data.communeId }),
      };

      const result = await httpClient.put<Neighborhood>(`/neighborhoods/${id}`, updatePayload);
      return result;
    } catch (error) {
      console.error('Error in NeighborhoodRepository.update:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      await httpClient.delete(`/neighborhoods/${id}`);
    } catch (error) {
      console.error('Error in NeighborhoodRepository.delete:', error);
      throw error;
    }
  }
}

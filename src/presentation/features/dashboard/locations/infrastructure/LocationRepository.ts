import {
  Commune,
  Neighborhood,
  CreateCommuneDto,
  CreateNeighborhoodDto,
  UpdateCommuneDto,
  UpdateNeighborhoodDto,
} from '@/services/api';
import {
  ICommuneRepository,
  INeighborhoodRepository,
  ICityRepository,
  PaginatedCommunes,
  PaginatedNeighborhoods,
  CommuneFilters,
  NeighborhoodFilters,
  City,
} from '../domain/repositories/ILocationRepository';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';

export class CommuneRepository implements ICommuneRepository {
  
  async getAllWithPagination(filters: CommuneFilters): Promise<PaginatedCommunes> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Build query params
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);

      // Direct API call with authentication
      const result = await httpClient.get<PaginatedCommunes | Commune[]>(
        `/communes?${params.toString()}`
      );
      
      // Handle both array and paginated responses
      if (Array.isArray(result)) {
        return {
          data: result,
          meta: {
            page: 1,
            limit: result.length,
            totalItems: result.length,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error in CommuneRepository.getAllWithPagination:', error);
      throw error;
    }
  }

  async getAll(): Promise<Commune[]> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const result = await httpClient.get<{ data: Commune[] } | Commune[]>('/communes');
      
      return Array.isArray(result) ? result : result.data;
    } catch (error) {
      console.error('Error in CommuneRepository.getAll:', error);
      throw error;
    }
  }

  async create(data: CreateCommuneDto): Promise<Commune> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const result = await httpClient.post<Commune>('/communes', data);
      return result;
    } catch (error) {
      console.error('Error in CommuneRepository.create:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateCommuneDto): Promise<Commune> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const result = await httpClient.put<Commune>(`/communes/${id}`, data);
      return result;
    } catch (error) {
      console.error('Error in CommuneRepository.update:', error);
      throw error;
    }
  }
}

export class NeighborhoodRepository implements INeighborhoodRepository {
  
  async getAllWithPagination(filters: NeighborhoodFilters): Promise<PaginatedNeighborhoods> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Build query params
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);

      // Direct API call with authentication
      const result = await httpClient.get<PaginatedNeighborhoods | Neighborhood[]>(
        `/neighborhoods?${params.toString()}`
      );
      
      // Handle both array and paginated responses
      if (Array.isArray(result)) {
        return {
          data: result,
          meta: {
            page: 1,
            limit: result.length,
            totalItems: result.length,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error in NeighborhoodRepository.getAllWithPagination:', error);
      throw error;
    }
  }

  async getAll(): Promise<Neighborhood[]> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const result = await httpClient.get<{ data: Neighborhood[] } | Neighborhood[]>('/neighborhoods');
      
      return Array.isArray(result) ? result : result.data;
    } catch (error) {
      console.error('Error in NeighborhoodRepository.getAll:', error);
      throw error;
    }
  }

  async create(data: CreateNeighborhoodDto): Promise<Neighborhood> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const result = await httpClient.post<Neighborhood>('/neighborhoods', data);
      return result;
    } catch (error) {
      console.error('Error in NeighborhoodRepository.create:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateNeighborhoodDto): Promise<Neighborhood> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const result = await httpClient.put<Neighborhood>(`/neighborhoods/${id}`, data);
      return result;
    } catch (error) {
      console.error('Error in NeighborhoodRepository.update:', error);
      throw error;
    }
  }
}

export class CityRepository implements ICityRepository {
  
  async getAll(): Promise<City[]> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication - or fallback to hardcoded for now
      try {
        const result = await httpClient.get<{ data: City[] } | City[]>('/cities');
        return Array.isArray(result) ? result : result.data;
      } catch (apiError) {
        // Fallback to hardcoded cities if API endpoint doesn't exist yet
        console.log('Cities API not available, using fallback data');
        return [
          { id: 1, name: "Bucaramanga" }
        ];
      }
    } catch (error) {
      console.error('Error in CityRepository.getAll:', error);
      throw error;
    }
  }
}

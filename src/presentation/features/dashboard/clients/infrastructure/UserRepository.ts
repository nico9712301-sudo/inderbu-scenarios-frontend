import {
  IUserRepository,
  IRoleRepository,
  INeighborhoodRepository,
  User,
  Role,
  Neighborhood,
  PaginatedUsers,
  UserFilters,
  CreateUserDto,
  UpdateUserDto,
} from '../domain/repositories/IUserRepository';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';

export class UserRepository implements IUserRepository {
  
  async getAllWithPagination(filters: UserFilters): Promise<PaginatedUsers> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Build query params
      const params = new URLSearchParams({
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 10).toString(),
      });

      // Add optional filters
      if (filters.search) params.append('search', filters.search);
      if (filters.neighborhoodId) params.append('neighborhoodId', filters.neighborhoodId.toString());
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());

      // Direct API call with authentication
      const data = await httpClient.get<PaginatedUsers>(`/users?${params.toString()}`);

      // Normalize user data (handle both firstName/lastName and first_name/last_name)
      const normalizedUsers = data.data.map(user => ({
        ...user,
        firstName: user.firstName || user.first_name || "",
        lastName: user.lastName || user.last_name || "",
      }));

      return {
        data: normalizedUsers,
        meta: data.meta,
      };
    } catch (error) {
      console.error('Error in UserRepository.getAllWithPagination:', error);
      throw error;
    }
  }

  async getByRoleWithPagination(roleId: number, filters: Omit<UserFilters, 'roleId'>): Promise<PaginatedUsers> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Build query params
      const params = new URLSearchParams({
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 10).toString(),
      });

      // Add optional filters
      if (filters.search) params.append('search', filters.search);
      if (filters.neighborhoodId) params.append('neighborhoodId', filters.neighborhoodId.toString());
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());

      // Direct API call with authentication
      const data = await httpClient.get<PaginatedUsers>(`/users/by-role/${roleId}?${params.toString()}`);

      // Normalize user data
      const normalizedUsers = data.data.map(user => ({
        ...user,
        firstName: user.firstName || user.first_name || "",
        lastName: user.lastName || user.last_name || "",
      }));

      return {
        data: normalizedUsers,
        meta: data.meta,
      };
    } catch (error) {
      console.error('Error in UserRepository.getByRoleWithPagination:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<User> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const user = await httpClient.get<User>(`/users/${id}`);
      
      // Normalize user data
      return {
        ...user,
        firstName: user.firstName || user.first_name || "",
        lastName: user.lastName || user.last_name || "",
      };
    } catch (error) {
      console.error('Error in UserRepository.getById:', error);
      throw error;
    }
  }

  async create(data: CreateUserDto): Promise<User> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const user = await httpClient.post<User>('/users', data);

      return {
        ...user,
        firstName: user.firstName || user.first_name || "",
        lastName: user.lastName || user.last_name || "",
      };
    } catch (error) {
      console.error('Error in UserRepository.create:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const user = await httpClient.put<User>(`/users/${id}`, data);

      return {
        ...user,
        firstName: user.firstName || user.first_name || "",
        lastName: user.lastName || user.last_name || "",
      };
    } catch (error) {
      console.error('Error in UserRepository.update:', error);
      throw error;
    }
  }
}

export class RoleRepository implements IRoleRepository {
  
  async getAll(): Promise<Role[]> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      try {
        // Try to get roles from API
        const result = await httpClient.get<{ data: Role[] } | Role[]>('/roles');
        return Array.isArray(result) ? result : result.data;
      } catch (apiError) {
        // Fallback to static roles if API endpoint doesn't exist yet
        console.log('Roles API not available, using fallback data');
        return [
          { id: 1, name: "admin", description: "Administrador" },
          { id: 2, name: "cliente", description: "Cliente" },
          { id: 3, name: "gestor", description: "Gestor" },
          { id: 4, name: "independiente", description: "Independiente" },
          { id: 5, name: "club-deportivo", description: "Club Deportivo" },
          { id: 6, name: "entrenador", description: "Entrenador" },
        ];
      }
    } catch (error) {
      console.error('Error in RoleRepository.getAll:', error);
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

      try {
        // Try to get neighborhoods from API
        const result = await httpClient.get<{ data: Neighborhood[] } | Neighborhood[]>('/neighborhoods');
        return Array.isArray(result) ? result : result.data;
      } catch (apiError) {
        // Fallback to static neighborhoods if API endpoint doesn't exist yet
        console.log('Neighborhoods API not available, using fallback data');  
        return [
          { id: 1, name: "San Alonso" },
          { id: 2, name: "Provenza" },
          { id: 3, name: "Álvarez Las Américas" },
        ];
      }
    } catch (error) {
      console.error('Error in NeighborhoodRepository.getAll:', error);
      throw error;
    }
  }
}

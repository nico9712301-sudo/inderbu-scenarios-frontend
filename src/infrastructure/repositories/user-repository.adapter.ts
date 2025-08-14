// Infrastructure Layer: User Repository Adapter
// Implements IUserRepository interface using HttpClient and UserTransformer

import { IUserRepository, UserFilters, CreateUserDto, UpdateUserDto, PaginatedUsers } from '@/entities/user/infrastructure/IUserRepository';
import { UserEntity } from '@/entities/user/domain/UserEntity';
import { UserTransformer, UserBackend } from '../transformers/UserTransformer';
import { IHttpClient } from '@/shared/api/http-client-server';
import { BackendPaginatedResponse } from '@/shared/api/backend-types';

/**
 * User Repository Adapter
 * 
 * Infrastructure layer implementation that:
 * 1. Uses HttpClient for API communication
 * 2. Uses UserTransformer for domain conversion
 * 3. Returns PaginatedEntities wrappers
 * 4. Handles backend response unwrapping
 */
export class UserRepositoryAdapter implements IUserRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  async getAll(filters: UserFilters): Promise<PaginatedUsers> {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 10).toString(),
      });

      // Add optional filters
      if (filters.search) params.append('search', filters.search);
      if (filters.neighborhoodId) params.append('neighborhoodId', filters.neighborhoodId.toString());
      if (filters.roleId) params.append('roleId', filters.roleId.toString());
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());

      // Call HTTP client - backend returns BackendPaginatedResponse
      const result = await this.httpClient.get<BackendPaginatedResponse<UserBackend>>(
        `/users?${params.toString()}`
      );

      // Transform backend data to domain entities
      const transformedData: UserEntity[] = result.data.map(userData => 
        UserTransformer.toDomain(userData)
      );

      return {
        data: transformedData,
        meta: result.meta,
      };

    } catch (error) {
      console.error('Error in UserRepositoryAdapter.getAll:', error);
      throw error;
    }
  }

  async getByRole(roleId: number, filters: UserFilters): Promise<PaginatedUsers> {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 10).toString(),
        roleId: roleId.toString(),
      });

      // Add optional filters (excluding roleId since it's already set)
      if (filters.search) params.append('search', filters.search);
      if (filters.neighborhoodId) params.append('neighborhoodId', filters.neighborhoodId.toString());
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());

      // Call HTTP client - backend returns BackendPaginatedResponse
      const result = await this.httpClient.get<BackendPaginatedResponse<UserBackend>>(
        `/users/role/${roleId}?${params.toString()}`
      );

      // Transform backend data to domain entities
      const transformedData: UserEntity[] = result.data.map(userData => 
        UserTransformer.toDomain(userData)
      );

      return {
        data: transformedData,
        meta: result.meta,
      };

    } catch (error) {
      console.error('Error in UserRepositoryAdapter.getByRole:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<UserEntity> {
    try {
      // Input validation
      if (id <= 0) {
        throw new Error('User ID must be a positive number');
      }

      // Direct API call - simple backend response
      const result = await this.httpClient.get<UserBackend>(`/users/${id}`);
      
      // Transform backend data to domain entity
      return UserTransformer.toDomain(result);

    } catch (error) {
      console.error(`Error in UserRepositoryAdapter.getById for ID ${id}:`, error);
      throw error;
    }
  }

  async create(userData: CreateUserDto): Promise<UserEntity> {
    try {
      // Business validation
      if (!userData.email || !userData.firstName || !userData.lastName) {
        throw new Error('Email, first name, and last name are required');
      }

      // Direct API call - simple backend response
      const result = await this.httpClient.post<UserBackend>('/users', userData);
      
      // Transform backend data to domain entity
      return UserTransformer.toDomain(result);

    } catch (error) {
      console.error('Error in UserRepositoryAdapter.create:', error);
      throw error;
    }
  }

  async update(userData: UpdateUserDto): Promise<UserEntity> {
    try {
      // Input validation
      if (userData.id <= 0) {
        throw new Error('User ID must be a positive number');
      }

      // Direct API call - simple backend response
      const result = await this.httpClient.put<UserBackend>(`/users/${userData.id}`, userData);
      
      // Transform backend data to domain entity
      return UserTransformer.toDomain(result);

    } catch (error) {
      console.error(`Error in UserRepositoryAdapter.update for ID ${userData.id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      // Input validation
      if (id <= 0) {
        throw new Error('User ID must be a positive number');
      }

      // Make API request (soft delete - set isActive to false)
      await this.httpClient.delete(`/users/${id}`);
      
      return true;

    } catch (error) {
      console.error(`Error in UserRepositoryAdapter.delete for ID ${id}:`, error);
      throw error;
    }
  }

  async getByEmail(email: string): Promise<UserEntity | null> {
    try {
      // Input validation
      if (!email || !email.includes('@')) {
        throw new Error('Valid email is required');
      }

      // Direct API call - simple backend response
      const result = await this.httpClient.get<UserBackend | null>(`/users/email/${encodeURIComponent(email)}`);
      
      // Handle null response (user not found)
      if (!result) {
        return null;
      }

      // Transform backend data to domain entity
      return UserTransformer.toDomain(result);

    } catch (error) {
      // If it's a 404, return null instead of throwing
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      
      console.error(`Error in UserRepositoryAdapter.getByEmail for ${email}:`, error);
      throw error;
    }
  }

  async emailExists(email: string): Promise<boolean> {
    try {
      const user = await this.getByEmail(email);
      return user !== null;
    } catch (error) {
      console.error(`Error in UserRepositoryAdapter.emailExists for ${email}:`, error);
      return false;
    }
  }

  async getTotalCount(): Promise<number> {
    try {
      // Direct API call for total count
      const result = await this.httpClient.get<{ count: number }>('/users/count');
      
      return result.count;

    } catch (error) {
      console.error('Error in UserRepositoryAdapter.getTotalCount:', error);
      throw error;
    }
  }

  async getCountByRole(roleId: number): Promise<number> {
    try {
      // Input validation
      if (roleId <= 0) {
        throw new Error('Role ID must be a positive number');
      }

      // Direct API call for role-specific count
      const result = await this.httpClient.get<{ count: number }>(`/users/role/${roleId}/count`);
      
      return result.count;

    } catch (error) {
      console.error(`Error in UserRepositoryAdapter.getCountByRole for role ${roleId}:`, error);
      throw error;
    }
  }
}
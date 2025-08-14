// Infrastructure Layer: Role Repository Adapter
// Implements IRoleRepository interface using HttpClient and RoleTransformer

import { IRoleRepository, RoleFilters, PaginatedRoles } from '@/entities/role/infrastructure/IRoleRepository';
import { RoleEntity } from '@/entities/role/domain/RoleEntity';
import { RoleTransformer, RoleBackend } from '../transformers/RoleTransformer';
import { IHttpClient } from '@/shared/api/http-client-server';
import { BackendPaginatedResponse } from '@/shared/api/backend-types';

/**
 * Role Repository Adapter
 * 
 * Infrastructure layer implementation that:
 * 1. Uses HttpClient for API communication
 * 2. Uses RoleTransformer for domain conversion
 * 3. Returns PaginatedRoles wrappers
 * 4. Handles backend response unwrapping
 */
export class RoleRepositoryAdapter implements IRoleRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  async getAll(filters: RoleFilters = {}): Promise<PaginatedRoles> {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 50).toString(), // Roles typically don't need pagination
      });

      // Add optional filters
      if (filters.search) params.append('search', filters.search);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());

      // Call HTTP client - backend returns BackendPaginatedResponse
      const result = await this.httpClient.get<BackendPaginatedResponse<RoleBackend>>(
        `/roles?${params.toString()}`
      );

      // Transform backend data to domain entities
      const transformedData: RoleEntity[] = result.data.map(roleData => 
        RoleTransformer.toDomain(roleData)
      );

      return {
        data: transformedData,
        meta: result.meta,
      };

    } catch (error) {
      console.error('Error in RoleRepositoryAdapter.getAll:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<RoleEntity> {
    try {
      // Input validation
      if (id <= 0) {
        throw new Error('Role ID must be a positive number');
      }

      // Direct API call - simple backend response
      const result = await this.httpClient.get<RoleBackend>(`/roles/${id}`);
      
      // Transform backend data to domain entity
      return RoleTransformer.toDomain(result);

    } catch (error) {
      console.error(`Error in RoleRepositoryAdapter.getById for ID ${id}:`, error);
      throw error;
    }
  }

  async getTotalCount(): Promise<number> {
    try {
      // Direct API call for total count
      const result = await this.httpClient.get<{ count: number }>('/roles/count');
      
      return result.count;

    } catch (error) {
      console.error('Error in RoleRepositoryAdapter.getTotalCount:', error);
      throw error;
    }
  }
}
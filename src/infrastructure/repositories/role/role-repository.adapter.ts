import { IRoleRepository, RoleFilters, PaginatedRoles } from '@/entities/role/infrastructure/IRoleRepository';
import { RoleEntity } from '@/entities/role/domain/RoleEntity';

import { RoleBackend, RoleTransformer } from '@/infrastructure/transformers/RoleTransformer';

import { BackendPaginatedResponse } from '@/shared/api/backend-types';
import { IHttpClient } from '@/shared/api';
import { executeWithDomainError } from './execute-with-domain-error.wrapper';

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
    return executeWithDomainError(async () => {
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
    }, 'Failed to fetch roles');
  }

  async getById(id: number): Promise<RoleEntity> {
    return executeWithDomainError(async () => {
      // Direct API call - simple backend response
      const result = await this.httpClient.get<RoleBackend>(`/roles/${id}`);
      
      // Transform backend data to domain entity
      return RoleTransformer.toDomain(result);
    }, `Failed to fetch role ${id}`);
  }
}
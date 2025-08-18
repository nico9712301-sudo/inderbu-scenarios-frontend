import { executeWithDomainError } from "./execute-with-domain-error.wrapper";

import {
  IUserRepository,
  UserFilters,
  CreateUserDto,
  UpdateUserDto,
  PaginatedUsers,
} from "@/entities/user/infrastructure/IUserRepository";
import { UserEntity } from "@/entities/user/domain/UserEntity";

import { BackendPaginatedResponse, BackendResponse } from "@/shared/api/backend-types";
import { IHttpClient } from "@/shared/api/types";

import {
  UserBackend,
  UserTransformer,
} from "@/infrastructure/transformers/UserTransformer";

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
    console.log("Fetching Users with filters before:", filters);
    
    return executeWithDomainError(async () => {
      // Build query parameters
      const params = new URLSearchParams({
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 10).toString(),
      });

      // Add optional filters
      if (filters.search) params.append("search", filters.search);
      if (filters.neighborhoodId)
        params.append("neighborhoodId", filters.neighborhoodId.toString());
      if (filters.roleId && filters.roleId.length > 0) {
        filters.roleId.forEach((roleId) => {
          params.append("roleId", roleId.toString());
        });
      }
      if (filters.active !== undefined)
        params.append("active", filters.active.toString());
      if (filters.adminOnly) params.append("adminOnly", "true");

      console.log("Fetching Users with filters after:", params.toString());
      

      // Call HTTP client - backend returns BackendPaginatedResponse
      const result: BackendPaginatedResponse<UserBackend> =
        await this.httpClient.get<BackendPaginatedResponse<UserBackend>>(
          `/users?${params.toString()}`
        );

      console.log("Fetched Users:", result.data);

      // Transform backend data to domain entities
      let transformedData: UserEntity[] = result.data.map((userData) =>
        UserTransformer.toDomain(userData)
      );

      // Client-side filter for admin users if adminOnly is requested
      // This provides a fallback if backend doesn't support the adminOnly filter yet
      if (filters.adminOnly) {
        transformedData = transformedData.filter(
          (user) => user.roleId === 1 || user.roleId === 2 // super-admin or admin
        );
      }

      return {
        data: transformedData,
        meta: result.meta,
      };
    }, "Failed to fetch users");
  }
  
  async getById(id: number): Promise<UserEntity> {
    return executeWithDomainError(async () => {
      // Input validation
      if (id <= 0) {
        throw new Error("User ID must be a positive number");
      }

      // API call - backend returns wrapped response
      const result = await this.httpClient.get<BackendResponse<UserBackend>>(`/users/${id}`);

      // Extract data from wrapper and transform to domain entity
      return UserTransformer.toDomain(result.data);
    }, `Failed to fetch user ${id}`);
  }

  async create(userData: CreateUserDto): Promise<UserEntity> {
    return executeWithDomainError(async () => {
      // API call - backend returns wrapped response
      const result = await this.httpClient.post<BackendResponse<UserBackend>>(
        "/users",
        userData
      );

      console.log("User created response:", result.data);

      // Extract data from wrapper and transform to domain entity
      return UserTransformer.toDomain(result.data);
    }, "Failed to create user");
  }

  async update(id: number, userData: UpdateUserDto): Promise<UserEntity> {
    return executeWithDomainError(async () => {
      // API call - backend returns wrapped response
      const result = await this.httpClient.put<BackendResponse<UserBackend>>(
        `/users/${id}`,
        userData
      );

      console.log(`User ${id} updated response:`, result.data);
      

      // Extract data from wrapper and transform to domain entity
      return UserTransformer.toDomain(result.data);
    }, `Failed to update user ${id}`);
  }
}

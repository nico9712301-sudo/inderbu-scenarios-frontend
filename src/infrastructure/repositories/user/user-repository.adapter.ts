import { executeWithDomainError } from "./execute-with-domain-error.wrapper";

import {
  IUserRepository,
  UserFilters,
  CreateUserDto,
  UpdateUserDto,
  PaginatedUsers,
} from "@/entities/user/infrastructure/IUserRepository";
import { UserEntity } from "@/entities/user/domain/UserEntity";

import { BackendPaginatedResponse } from "@/shared/api/backend-types";
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
      if (filters.isActive !== undefined)
        params.append("isActive", filters.isActive.toString());
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

  async getByRole(
    roleId: number,
    filters: UserFilters
  ): Promise<PaginatedUsers> {
    return executeWithDomainError(async () => {
      // Build query parameters
      const params = new URLSearchParams({
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 10).toString(),
        roleId: roleId.toString(),
      });

      // Add optional filters (excluding roleId since it's already set)
      if (filters.search) params.append("search", filters.search);
      if (filters.neighborhoodId)
        params.append("neighborhoodId", filters.neighborhoodId.toString());
      if (filters.isActive !== undefined)
        params.append("isActive", filters.isActive.toString());

      // Call HTTP client - backend returns BackendPaginatedResponse
      const result = await this.httpClient.get<
        BackendPaginatedResponse<UserBackend>
      >(`/users/role/${roleId}?${params.toString()}`);

      // Transform backend data to domain entities
      const transformedData: UserEntity[] = result.data.map((userData) =>
        UserTransformer.toDomain(userData)
      );

      return {
        data: transformedData,
        meta: result.meta,
      };
    }, `Failed to fetch users by role ${roleId}`);
  }

  async getById(id: number): Promise<UserEntity> {
    return executeWithDomainError(async () => {
      // Input validation
      if (id <= 0) {
        throw new Error("User ID must be a positive number");
      }

      // Direct API call - simple backend response
      const result = await this.httpClient.get<UserBackend>(`/users/${id}`);

      // Transform backend data to domain entity
      return UserTransformer.toDomain(result);
    }, `Failed to fetch user ${id}`);
  }

  async create(userData: CreateUserDto): Promise<UserEntity> {
    return executeWithDomainError(async () => {
      // Business validation
      if (!userData.email || !userData.firstName || !userData.lastName) {
        throw new Error("Email, first name, and last name are required");
      }

      // Direct API call - simple backend response
      const result = await this.httpClient.post<UserBackend>(
        "/users",
        userData
      );

      // Transform backend data to domain entity
      return UserTransformer.toDomain(result);
    }, "Failed to create user");
  }

  async update(id: number, userData: UpdateUserDto): Promise<UserEntity> {
    return executeWithDomainError(async () => {
      // Input validation
      if (id <= 0) {
        throw new Error("User ID must be a positive number");
      }

      // Direct API call - simple backend response
      const result = await this.httpClient.put<UserBackend>(
        `/users/${id}`,
        userData
      );

      // Transform backend data to domain entity
      return UserTransformer.toDomain(result);
    }, `Failed to update user ${id}`);
  }

  async delete(id: number): Promise<boolean> {
    return executeWithDomainError(async () => {
      // Input validation
      if (id <= 0) {
        throw new Error("User ID must be a positive number");
      }

      // Make API request (soft delete - set isActive to false)
      await this.httpClient.delete(`/users/${id}`);

      return true;
    }, `Failed to delete user ${id}`);
  }

  async getByEmail(email: string): Promise<UserEntity | null> {
    return executeWithDomainError(async () => {
      // Input validation
      if (!email || !email.includes("@")) {
        throw new Error("Valid email is required");
      }

      // Direct API call - simple backend response
      const result = await this.httpClient.get<UserBackend | null>(
        `/users/email/${encodeURIComponent(email)}`
      );

      // Handle null response (user not found)
      if (!result) {
        return null;
      }

      // Transform backend data to domain entity
      return UserTransformer.toDomain(result);
    }, `Failed to fetch user by email ${email}`);
  }

  async emailExists(email: string): Promise<boolean> {
    return executeWithDomainError(async () => {
      const user = await this.getByEmail(email);
      return user !== null;
    }, `Failed to check if email exists ${email}`);
  }

  async getTotalCount(): Promise<number> {
    return executeWithDomainError(async () => {
      // Direct API call for total count
      const result = await this.httpClient.get<{ count: number }>(
        "/users/count"
      );

      return result.count;
    }, "Failed to get users total count");
  }

  async getCountByRole(roleId: number): Promise<number> {
    return executeWithDomainError(async () => {
      // Input validation
      if (roleId <= 0) {
        throw new Error("Role ID must be a positive number");
      }

      // Direct API call for role-specific count
      const result = await this.httpClient.get<{ count: number }>(
        `/users/role/${roleId}/count`
      );

      return result.count;
    }, `Failed to get user count by role ${roleId}`);
  }
}

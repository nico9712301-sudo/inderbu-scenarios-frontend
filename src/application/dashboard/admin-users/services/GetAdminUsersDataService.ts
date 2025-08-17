// Application Layer: Get Admin Users Data Service
// Orchestrates multiple use cases for dashboard admin users page data

import { UserEntity } from "@/entities/user/domain/UserEntity";
import { UserFilters } from "@/entities/user/infrastructure/IUserRepository";
import { GetUsersUseCase } from "../../clients/use-cases/GetUsersUseCase";
import { GetRolesUseCase } from "../../clients/use-cases/GetRolesUseCase";
import { RoleEntity } from "@/entities/role/domain/RoleEntity";
import { EUserRole } from "@/shared/enums/user-role.enum";

// Filter options for UI components
export interface FilterOption {
  value: string;
  label: string;
}

// Response interface containing all dashboard admin users data
export interface IAdminUsersDataResponse {
  users: UserEntity[]; // Domain entities (only admin and super-admin)
  roles: RoleEntity[]; // Only admin roles
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  filters: UserFilters;
  filterOptions: {
    roles: FilterOption[];
    status: FilterOption[];
  };
}

/**
 * Get Admin Users Data Service
 *
 * Application service that orchestrates multiple use cases to provide
 * complete dashboard admin users page data. Only includes users with
 * admin or super-admin roles.
 */
export class GetAdminUsersDataService {
  constructor(
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getRolesUseCase: GetRolesUseCase
  ) {}

  async execute(filters: UserFilters = {}): Promise<IAdminUsersDataResponse> {
    try {
      // Business validation
      if (filters.page !== undefined && filters.page <= 0) {
        throw new Error("Page number must be greater than 0");
      }

      if (
        filters.limit !== undefined &&
        (filters.limit <= 0 || filters.limit > 100)
      ) {
        throw new Error("Limit must be between 1 and 100");
      }

      // Default filters with business rules for admin users only
      const defaultFilters: UserFilters = {
        page: 1,
        limit: 10, // Business rule: consistent page size for admin users
        search: "",
        adminOnly: true, // Business rule: only show admin users
        ...filters,
      };

      // Sanitize search input
      if (defaultFilters.search) {
        defaultFilters.search = defaultFilters.search.trim().substring(0, 100);
      }

      // Orchestrate multiple use cases in parallel
      const [usersResult, rolesResult] = await Promise.all([
        this.getUsersUseCase.execute(defaultFilters),
        this.getRolesUseCase.execute(),
      ]);

      // Extract data from pagination wrappers - Application Service responsibility
      const users: UserEntity[] = usersResult.data; // Extract from PaginatedUsers
      const allRoles: RoleEntity[] = rolesResult.data; // Extract from PaginatedRoles

      // Business Logic: Filter roles to only admin and super-admin
      const adminRoles = allRoles.filter((role: RoleEntity) => 
        role.name === "super-admin" || role.name === "admin"
      );

      // Prepare filter options for UI components
      const filterOptions = {
        roles: adminRoles.map((role: RoleEntity) => ({
          value: role.id.toString(),
          label: role.description,
        })),
        status: [
          { value: "true", label: "Activo" },
          { value: "false", label: "Inactivo" },
        ],
      };

      return {
        users, // Pure domain entities (admin only)
        roles: adminRoles, // Only admin roles
        meta: usersResult.meta,
        filters: defaultFilters,
        filterOptions,
      };
    } catch (error) {
      console.error("Error in GetAdminUsersDataService:", error);
      throw error;
    }
  }
}
// Application Layer: Get Clients Data Service
// Orchestrates multiple use cases for dashboard clients page data

import { UserEntity } from "@/entities/user/domain/UserEntity";
import { NeighborhoodEntity } from "@/entities/neighborhood/domain/NeighborhoodEntity";
import { UserFilters } from "@/entities/user/infrastructure/IUserRepository";
import { GetUsersUseCase } from "../use-cases/GetUsersUseCase";
import { GetNeighborhoodsUseCase } from "../../scenarios/use-cases/GetNeighborhoodsUseCase";
import { GetRolesUseCase } from "../use-cases/GetRolesUseCase";
import { RoleEntity } from "@/entities/role/domain/RoleEntity";

// Filter options for UI components
export interface FilterOption {
  value: string;
  label: string;
}

// Response interface containing all dashboard clients data
export interface IClientsDataResponse {
  users: UserEntity[]; // Domain entities
  roles: RoleEntity[]; // Simple role entities
  neighborhoods: NeighborhoodEntity[]; // Domain entities
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  filters: UserFilters;
  filterOptions: {
    roles: FilterOption[];
    neighborhoods: FilterOption[];
    status: FilterOption[];
  };
}

/**
 * Get Clients Data Service
 *
 * Application service that orchestrates multiple use cases to provide
 * complete dashboard clients page data. Extracts data from pagination
 * wrappers and returns pure domain entities.
 */
export class GetClientsDataService {
  constructor(
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getRolesUseCase: GetRolesUseCase,
    private readonly getNeighborhoodsUseCase: GetNeighborhoodsUseCase
  ) {}

  async execute(filters: UserFilters = {}): Promise<IClientsDataResponse> {
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

      // Default filters with business rules
      const defaultFilters: UserFilters = {
        page: 1,
        limit: 10, // Business rule: consistent page size for clients
        search: "",
        ...filters,
      };

      // Sanitize search input
      if (defaultFilters.search) {
        defaultFilters.search = defaultFilters.search.trim().substring(0, 100);
      }

      // Orchestrate multiple use cases in parallel
      const [usersResult, neighborhoodsResult, rolesResult] = await Promise.all(
        [
          this.getUsersUseCase.execute(defaultFilters),
          this.getNeighborhoodsUseCase.execute(),
          this.getRolesUseCase.execute(),
        ]
      );

      // Extract data from pagination wrappers - Application Service responsibility
      const users: UserEntity[] = usersResult.data; // Extract from PaginatedUsers
      const neighborhoods: NeighborhoodEntity[] = neighborhoodsResult.data; // Extract from PaginatedNeighborhoods
      const roles: RoleEntity[] = rolesResult.data; // Extract from PaginatedRoles

      // Prepare filter options for UI components
      const filterOptions = {
        roles: roles.map((role: RoleEntity) => ({
          value: role.id.toString(),
          label: role.description,
        })),
        neighborhoods: neighborhoods.map(
          (neighborhood: NeighborhoodEntity) => ({
            value: neighborhood.id.toString(),
            label: neighborhood.name,
          })
        ),
        status: [
          { value: "true", label: "Activo" },
          { value: "false", label: "Inactivo" },
        ],
      };

      return {
        users, // Pure domain entities
        roles, // Simple role entities
        neighborhoods, // Pure domain entities
        meta: usersResult.meta,
        filters: defaultFilters,
        filterOptions,
      };
    } catch (error) {
      console.error("Error in GetClientsDataService:", error);
      throw error;
    }
  }
}

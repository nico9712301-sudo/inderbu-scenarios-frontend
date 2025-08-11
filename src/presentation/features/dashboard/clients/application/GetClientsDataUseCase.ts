import {
  IUserRepository,
  IRoleRepository,
  INeighborhoodRepository,
  User,
  Role,
  Neighborhood,
  UserFilters,
  PaginatedUsers,
} from '../domain/repositories/IUserRepository';

export interface FilterOption {
  value: string;
  label: string;
}

export interface ClientsDataResponse {
  users: User[];
  roles: Role[];
  neighborhoods: Neighborhood[];
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

export class GetClientsDataUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly neighborhoodRepository: INeighborhoodRepository
  ) {}

  async execute(filters: UserFilters = {}): Promise<ClientsDataResponse> {
    try {
      // Default filters
      const defaultFilters: UserFilters = {
        page: 1,
        limit: 10,
        search: "",
        ...filters,
      };

      // Load users and catalog data in parallel
      const [
        usersResult,
        roles,
        neighborhoods,
      ] = await Promise.all([
        // Use role-specific endpoint if roleId filter is present
        filters.roleId 
          ? this.userRepository.getByRoleWithPagination(
              filters.roleId, 
              { ...defaultFilters, roleId: undefined }
            )
          : this.userRepository.getAllWithPagination(defaultFilters),
        this.roleRepository.getAll(),
        this.neighborhoodRepository.getAll(),
      ]);

      // Prepare filter options for UI
      const filterOptions = {
        roles: roles.map(role => ({
          value: role.id.toString(),
          label: role.description,
        })),
        neighborhoods: neighborhoods.map(neighborhood => ({
          value: neighborhood.id.toString(),
          label: neighborhood.name,
        })),
        status: [
          { value: "true", label: "Activo" },
          { value: "false", label: "Inactivo" },
        ],
      };

      return {
        users: usersResult.data,
        roles,
        neighborhoods,
        meta: usersResult.meta,
        filters: defaultFilters,
        filterOptions,
      };

    } catch (error) {
      console.error('Error in GetClientsDataUseCase:', error);
      throw error;
    }
  }
}

// User entities and DTOs
export interface User {
  id: number;
  dni: number;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  role: {
    id: number;
    name: string;
    description: string;
  };
  neighborhood: {
    id: number;
    name: string;
  };
  roleId?: number;
  neighborhoodId?: number;
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface Neighborhood {
  id: number;
  name: string;
}

// Paginated results
export interface PaginatedUsers {
  data: User[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

// Filters
export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: number;
  neighborhoodId?: number;
  isActive?: boolean;
}

// DTOs for CRUD operations
export interface CreateUserDto {
  dni: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  roleId: number;
  neighborhoodId: number;
  isActive?: boolean;
}

export interface UpdateUserDto {
  dni?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  roleId?: number;
  neighborhoodId?: number;
  isActive?: boolean;
}

// Repository interfaces
export interface IUserRepository {
  getAllWithPagination(filters: UserFilters): Promise<PaginatedUsers>;
  getByRoleWithPagination(roleId: number, filters: Omit<UserFilters, 'roleId'>): Promise<PaginatedUsers>;
  getById(id: number): Promise<User>;
  create(data: CreateUserDto): Promise<User>;
  update(id: number, data: UpdateUserDto): Promise<User>;
}

export interface IRoleRepository {
  getAll(): Promise<Role[]>;
}

export interface INeighborhoodRepository {
  getAll(): Promise<Neighborhood[]>;
}

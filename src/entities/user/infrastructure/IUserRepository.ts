import { PageMetaDto } from '@/shared/api';
import { UserEntity } from '../domain/UserEntity';

// User filters for querying
export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: number[];
  neighborhoodId?: number;
  isActive?: boolean;
  adminOnly?: boolean; // Filter to only include admin and super-admin users
}

// DTO for creating users
export interface CreateUserDto {
  dni: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: number;
  address: string;
  neighborhoodId: number;
  password?: string;
}

// DTO for updating users
export interface UpdateUserDto {
  dni?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  address?: string;
  neighborhoodId?: number;
  isActive?: boolean;
}

// Paginated users response
export interface PaginatedUsers {
  data: UserEntity[];
  meta: PageMetaDto;
}

/**
 * User Repository Interface
 * 
 * Defines the contract for user data access operations.
 * Returns domain entities wrapped in pagination structures.
 */
export interface IUserRepository {
  getAll(filters: UserFilters): Promise<PaginatedUsers>;
  getByRole(roleId: number, filters: UserFilters): Promise<PaginatedUsers>;
  getById(id: number): Promise<UserEntity>;
  create(userData: CreateUserDto): Promise<UserEntity>;
  update(id: number, userData: UpdateUserDto): Promise<UserEntity>;
  delete(id: number): Promise<boolean>;
  getByEmail(email: string): Promise<UserEntity | null>;
  emailExists(email: string): Promise<boolean>;
  getTotalCount(): Promise<number>;
  getCountByRole(roleId: number): Promise<number>;
}
// Domain Layer: User Repository Interface
// Contract for user data access operations

import { UserEntity } from '../domain/UserEntity';
import { PageMeta } from '@/services/api';

// User filters for querying
export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: number;
  neighborhoodId?: number;
  isActive?: boolean;
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
  password: string;
}

// DTO for updating users
export interface UpdateUserDto {
  id: number;
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
  meta: PageMeta;
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
  update(userData: UpdateUserDto): Promise<UserEntity>;
  delete(id: number): Promise<boolean>;
  getByEmail(email: string): Promise<UserEntity | null>;
  emailExists(email: string): Promise<boolean>;
  getTotalCount(): Promise<number>;
  getCountByRole(roleId: number): Promise<number>;
}
// Domain Layer: Role Repository Interface
// Contract for role data access operations

import { RoleEntity } from '../domain/RoleEntity';
import { PageMeta } from '@/services/api';

// Role filters for querying
export interface RoleFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

// Paginated roles response
export interface PaginatedRoles {
  data: RoleEntity[];
  meta: PageMeta;
}

/**
 * Role Repository Interface
 * 
 * Defines the contract for role data access operations.
 * Returns domain entities wrapped in pagination structures.
 */
export interface IRoleRepository {
  /**
   * Get all roles with pagination and filters
   */
  getAll(filters?: RoleFilters): Promise<PaginatedRoles>;

  /**
   * Get role by ID
   */
  getById(id: number): Promise<RoleEntity>;

  /**
   * Get total role count
   */
  getTotalCount(): Promise<number>;
}
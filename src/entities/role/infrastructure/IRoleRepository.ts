import { RoleEntity } from '../domain/RoleEntity';
import { PageMeta } from '@/shared/api/pagination';

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
  getAll(filters?: RoleFilters): Promise<PaginatedRoles>;
  getById(id: number): Promise<RoleEntity>;
}
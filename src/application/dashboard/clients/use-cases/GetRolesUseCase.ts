// Application Layer: Get Roles Use Case
// Single-domain use case for retrieving user roles

import { IRoleRepository, PaginatedRoles } from '@/entities/role/infrastructure/IRoleRepository';
import { RoleEntity } from '@/entities/role/domain/RoleEntity';

/**
 * Get Roles Use Case
 * 
 * Single-domain use case that handles role retrieval operations.
 * Returns PaginatedRoles wrapper following established pattern.
 */
export class GetRolesUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository
  ) {}

  /**
   * Execute use case - get all available user roles
   */
  async execute(): Promise<PaginatedRoles> {
    try {
      // Get all roles (typically roles don't need complex filtering)
      const result = await this.roleRepository.getAll({
        page: 1,
        limit: 50, // Roles are usually a small set
        isActive: true // Only get active roles for user assignment
      });

      // Business validation
      if (result.data.length === 0) {
        console.warn('No active roles found - this may indicate a system configuration issue');
      }

      // Sort by ID for consistency (domain logic)
      result.data.sort((a, b) => a.id - b.id);

      return result;

    } catch (error) {
      console.error('Error in GetRolesUseCase:', error);
      throw error;
    }
  }
}
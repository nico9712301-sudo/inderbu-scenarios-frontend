import { IUserRepository, UserFilters, PaginatedUsers } from '@/entities/user/infrastructure/IUserRepository';
import { UserEntity } from '@/entities/user/domain/UserEntity';

/**
 * Get Users Use Case
 * 
 * Single-domain use case that handles user retrieval operations.
 * Returns PaginatedEntities wrapper following established pattern.
 */
export class GetUsersUseCase {
  constructor(
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * Execute use case - get paginated users with filters
   */
  async execute(filters: UserFilters = {}): Promise<PaginatedUsers> {
    try {
      // Business validation
      if (filters.page !== undefined && filters.page <= 0) {
        throw new Error('Page number must be greater than 0');
      }
      
      if (filters.limit !== undefined && (filters.limit <= 0 || filters.limit > 100)) {
        throw new Error('Limit must be between 1 and 100');
      }

      // Apply default values following business rules
      const processedFilters: UserFilters = {
        page: 1,
        limit: 10,
        search: "",
        ...filters,
      };

      // Sanitize search input
      if (processedFilters.search) {
        processedFilters.search = processedFilters.search.trim().substring(0, 100);
      }

      // Delegate to repository - returns PaginatedUsers
      const result = await this.userRepository.getAll(processedFilters);
      
      // Additional domain validation if needed
      if (result.data.length === 0 && processedFilters.page! > 1) {
        console.warn(`No users found on page ${processedFilters.page}`);
      }

      return result;

    } catch (error) {
      console.error('Error in GetUsersUseCase:', error);
      throw error;
    }
  }

  /**
   * Execute use case - get paginated users by role
   */
  async executeByRole(roleId: number, filters: UserFilters = {}): Promise<PaginatedUsers> {
    try {
      // Input validation
      if (roleId <= 0) {
        throw new Error('Role ID must be a positive number');
      }

      // Business validation
      if (filters.page !== undefined && filters.page <= 0) {
        throw new Error('Page number must be greater than 0');
      }
      
      if (filters.limit !== undefined && (filters.limit <= 0 || filters.limit > 100)) {
        throw new Error('Limit must be between 1 and 100');
      }

      // Apply default values following business rules
      const processedFilters: UserFilters = {
        page: 1,
        limit: 10,
        search: "",
        ...filters,
      };

      // Sanitize search input
      if (processedFilters.search) {
        processedFilters.search = processedFilters.search.trim().substring(0, 100);
      }

      // Delegate to repository - returns PaginatedUsers
      const result = await this.userRepository.getByRole(roleId, processedFilters);
      
      // Additional domain validation if needed
      if (result.data.length === 0 && processedFilters.page! > 1) {
        console.warn(`No users with role ${roleId} found on page ${processedFilters.page}`);
      }

      return result;

    } catch (error) {
      console.error(`Error in GetUsersUseCase.executeByRole for role ${roleId}:`, error);
      throw error;
    }
  }
}
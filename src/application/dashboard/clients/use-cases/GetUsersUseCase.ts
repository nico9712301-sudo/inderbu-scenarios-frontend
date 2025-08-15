import { IUserRepository, UserFilters, PaginatedUsers } from '@/entities/user/infrastructure/IUserRepository';

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

      return await this.userRepository.getAll(processedFilters);

    } catch (error) {
      console.error('Error in GetUsersUseCase:', error);
      throw error;
    }
  }
}
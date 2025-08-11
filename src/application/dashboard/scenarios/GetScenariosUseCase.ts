import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/config/di/types';
import type { IScenarioRepository, ScenarioFilters } from '@/entities/scenario/infrastructure/IScenarioRepository';

export interface PaginatedScenariosResponse {
  data: any[]; // Using any temporarily until we unify types
  meta: any;   // Using any temporarily until we unify types
}

@injectable()
export class GetScenariosUseCase {
  constructor(
    @inject(TYPES.IScenarioRepository)
    private readonly scenarioRepository: IScenarioRepository
  ) { }

  async execute(filters: ScenarioFilters = {}): Promise<PaginatedScenariosResponse> {
    try {
      // Business validation
      if (filters.page !== undefined && filters.page <= 0) {
        throw new Error('Page number must be greater than 0');
      }

      if (filters.limit !== undefined && (filters.limit <= 0 || filters.limit > 100)) {
        throw new Error('Limit must be between 1 and 100');
      }

      // Default filters with business rules
      const defaultFilters: ScenarioFilters = {
        page: 1,
        limit: 7, // Business rule: default page size
        search: "",
        ...filters,
      };

      // Sanitize search input
      if (defaultFilters.search) {
        defaultFilters.search = defaultFilters.search.trim().substring(0, 100); // Max 100 chars
      }

      // Get scenarios with pagination
      const result = await this.scenarioRepository.findWithPagination(defaultFilters);

      return {
        data: result.data,
        meta: result.meta,
      };

    } catch (error) {
      console.error('Error in GetScenariosUseCase:', error);
      throw error;
    }
  }
}
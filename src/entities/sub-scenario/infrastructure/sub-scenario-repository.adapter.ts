import { SubScenarioRepository, ISubScenarioFilters, PaginatedSubScenarios } from '@/entities/sub-scenario/domain/sub-scenario.domain';

// Existing API interface (what currently exists)
interface SubScenarioApiService {
  getSubScenarios(params: {
    page: number;
    limit: number;
    searchQuery: string;
    activityAreaId: number;
    neighborhoodId: number;
    hasCost?: boolean;
  }): Promise<PaginatedSubScenarios>;
}

// Infrastructure: Adapter Pattern - Bridge existing API to domain interface
export class SubScenarioRepositoryAdapter implements SubScenarioRepository {
  constructor(private readonly apiService: SubScenarioApiService) {}

  async findFiltered(filters: ISubScenarioFilters): Promise<PaginatedSubScenarios> {
    console.log('SubScenarioRepositoryAdapter: Executing findFiltered with:', filters);

    try {
      // Transform domain filters to API parameters
      const apiParams = {
        page: filters.page,
        limit: filters.limit,
        searchQuery: filters.searchQuery,
        activityAreaId: filters.activityAreaId || 0,
        neighborhoodId: filters.neighborhoodId || 0,
        hasCost: filters.hasCost
      };

      console.log('Calling existing API with transformed params:', apiParams);

      // Call existing API service
      const result = await this.apiService.getSubScenarios(apiParams);

      console.log(`SubScenarioRepositoryAdapter: Found ${result.data.length} sub-scenarios`);
      return result;

    } catch (error) {
      console.error('SubScenarioRepositoryAdapter: Error in findFiltered:', error);
      throw error; // Re-throw to let domain handle it
    }
  }
}

// Factory function for DI container
export function createSubScenarioRepositoryAdapter(apiService: SubScenarioApiService): SubScenarioRepository {
  return new SubScenarioRepositoryAdapter(apiService);
}

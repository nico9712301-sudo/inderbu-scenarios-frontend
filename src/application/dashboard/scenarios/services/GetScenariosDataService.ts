import { ScenarioFilters } from '@/entities/scenario/infrastructure/IScenarioRepository';
import { GetScenariosUseCase } from '../use-cases/GetScenariosUseCase';
import { GetNeighborhoodsUseCase } from '../use-cases/GetNeighborhoodsUseCase';

export interface IScenariosDataResponse {
  scenarios: any[]; // Using any temporarily until we unify types
  neighborhoods: any[]; // Using any temporarily until we unify types
  meta: any; // Using any temporarily until we unify types
  filters: ScenarioFilters;
}

export class GetScenariosDataService {
  constructor(
    private readonly getScenariosUseCase: GetScenariosUseCase,
    private readonly getNeighborhoodsUseCase: GetNeighborhoodsUseCase
  ) {}

  async execute(filters: ScenarioFilters = {}): Promise<IScenariosDataResponse> {
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
        limit: 7, // Business rule: consistent page size
        search: "",
        ...filters,
      };

      // Sanitize search input
      if (defaultFilters.search) {
        defaultFilters.search = defaultFilters.search.trim().substring(0, 100);
      }

      // Compose using dedicated use cases
      const [
        scenarios,
        neighborhoods,
      ] = await Promise.all([
        this.getScenariosUseCase.execute(defaultFilters),
        this.getNeighborhoodsUseCase.execute(),
      ]);

      return {
        scenarios: scenarios.data,
        neighborhoods: neighborhoods.data,
        meta: scenarios.meta,
        filters: defaultFilters,
      };

    } catch (error) {
      console.error('Error in GetScenariosDataService:', error);
      throw error;
    }
  }
}

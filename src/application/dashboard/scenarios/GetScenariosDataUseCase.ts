import { injectable, inject } from 'inversify';
import { GetScenariosUseCase } from './GetScenariosUseCase';
import { GetNeighborhoodsUseCase } from './GetNeighborhoodsUseCase';
import { TYPES } from '@/infrastructure/config/di/types';
import { ScenarioFilters } from '@/entities/scenario/infrastructure/IScenarioRepository';

export interface IScenariosDataResponse {
  scenarios: any[]; // Using any temporarily until we unify types
  neighborhoods: any[]; // Using any temporarily until we unify types
  meta: any; // Using any temporarily until we unify types
  filters: ScenarioFilters;
}

@injectable()
export class GetScenariosDataUseCase {
  constructor(
    @inject(TYPES.GetScenariosUseCase)
    private readonly getScenariosUseCase: GetScenariosUseCase,
    @inject(TYPES.GetNeighborhoodsUseCase)
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
        scenariosResult,
        neighborhoods,
      ] = await Promise.all([
        this.getScenariosUseCase.execute(defaultFilters),
        this.getNeighborhoodsUseCase.execute(),
      ]);

      return {
        scenarios: scenariosResult.data,
        neighborhoods,
        meta: scenariosResult.meta,
        filters: defaultFilters,
      };

    } catch (error) {
      console.error('Error in GetScenariosDataUseCase:', error);
      throw error;
    }
  }
}

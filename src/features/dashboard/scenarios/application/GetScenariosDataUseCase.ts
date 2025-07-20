import { Neighborhood, Scenario, PageMeta } from '@/services/api';
import { IScenariosFilters } from '../domain/repositories/IScenarioRepository';
import { GetScenariosUseCase } from './GetScenariosUseCase';
import { GetNeighborhoodsUseCase } from './GetNeighborhoodsUseCase';

export interface IScenariosDataResponse {
  scenarios: Scenario[];
  neighborhoods: Neighborhood[];
  meta: PageMeta;
  filters: IScenariosFilters;
}

export class GetScenariosDataUseCase {
  constructor(
    private readonly getScenariosUseCase: GetScenariosUseCase,
    private readonly getNeighborhoodsUseCase: GetNeighborhoodsUseCase
  ) {}

  async execute(filters: IScenariosFilters = {}): Promise<IScenariosDataResponse> {
    try {
      // Default filters
      const defaultFilters: IScenariosFilters = {
        page: 1,
        limit: 7,
        search: "",
        ...filters,
      };

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

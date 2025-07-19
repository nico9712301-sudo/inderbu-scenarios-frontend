import { Neighborhood, Scenario, PageMeta } from '@/services/api';
import { IScenarioRepository, INeighborhoodRepository, IScenariosFilters } from '../domain/repositories/IScenarioRepository';

export interface IScenariosDataResponse {
  scenarios: Scenario[];
  neighborhoods: Neighborhood[];
  meta: PageMeta;
  filters: IScenariosFilters;
}

export class GetScenariosDataUseCase {
  constructor(
    private readonly scenarioRepository: IScenarioRepository,
    private readonly neighborhoodRepository: INeighborhoodRepository
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

      // Load scenarios and neighborhoods in parallel using repositories
      const [
        scenariosResult,
        neighborhoods,
      ] = await Promise.all([
        this.scenarioRepository.getAllWithPagination(defaultFilters),
        this.neighborhoodRepository.getAll(),
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

import { Scenario, PageMeta } from '@/services/api';
import { IScenarioRepository, IScenariosFilters } from '../domain/repositories/IScenarioRepository';

export interface PaginatedScenariosResponse {
  data: Scenario[];
  meta: PageMeta;
}

export class GetScenariosUseCase {
  constructor(
    private readonly scenarioRepository: IScenarioRepository
  ) {}

  async execute(filters: IScenariosFilters = {}): Promise<PaginatedScenariosResponse> {
    try {
      // Default filters
      const defaultFilters: IScenariosFilters = {
        page: 1,
        limit: 7,
        search: "",
        ...filters,
      };

      // Get scenarios with pagination
      const result = await this.scenarioRepository.getAllWithPagination(defaultFilters);

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
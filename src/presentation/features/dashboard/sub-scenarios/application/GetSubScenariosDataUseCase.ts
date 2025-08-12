import { ISubScenarioRepository, SubScenariosFilters } from '../domain/repositories/ISubScenarioRepository';
import { IActivityAreaRepository } from '@/entities/activity-area/domain/IActivityAreaRepository';
import { INeighborhoodRepository } from '@/entities/neighborhood/domain/INeighborhoodRepository';
import { SubScenario, Scenario, ActivityArea, Neighborhood, PageMeta } from '@/services/api';
import { IScenarioRepository } from '@/entities/scenario/infrastructure/IScenarioRepository';

export interface ISubScenariosDataResponse {
  subScenarios: SubScenario[];
  scenarios: Scenario[];
  activityAreas: ActivityArea[];
  neighborhoods: Neighborhood[];
  fieldSurfaceTypes: { id: number; name: string }[];
  meta: PageMeta;
  filters: SubScenariosFilters;
}

export class GetSubScenariosDataUseCase {
  constructor(
    private readonly subScenarioRepository: ISubScenarioRepository,
    private readonly scenarioRepository: IScenarioRepository,
    private readonly activityAreaRepository: IActivityAreaRepository,
    private readonly neighborhoodRepository: INeighborhoodRepository
  ) {}

  async execute(filters: SubScenariosFilters): Promise<ISubScenariosDataResponse> {
    try {
      // Default filters
      const defaultFilters: SubScenariosFilters = {
        page: 1,
        limit: 7,
        search: "",
        ...filters,
      };

      console.log({defaultFilters});
      
      // Load all catalog data and sub-scenarios in parallel using repositories
      const [
        scenarios,
        activityAreas,
        neighborhoods,
        subScenariosResult,
      ] = await Promise.all([
        this.scenarioRepository.getAllWithLimit(100), // Ajustado para scenarios
        this.activityAreaRepository.getAll(),
        this.neighborhoodRepository.getAll(),
        this.subScenarioRepository.getAllWithPagination(defaultFilters),
      ]);

      // TODO: Static field surface types (MUST come from API in the future)
      const fieldSurfaceTypes = [
        { id: 1, name: "Concreto" },
        { id: 2, name: "Sintético" },
        { id: 3, name: "Césped" },
        { id: 4, name: "Cemento" },
      ];

      return {
        subScenarios: subScenariosResult.data,
        scenarios,
        activityAreas,
        neighborhoods,
        fieldSurfaceTypes,
        meta: subScenariosResult.meta,
        filters: defaultFilters,
      };

    } catch (error) {
      console.error('Error in GetSubScenariosDataUseCase:', error);
      throw error;
    }
  }
}

import { SubScenariosFilters } from '@/entities/sub-scenario/infrastructure/ISubScenarioRepository';
import { PageMeta } from '@/shared/api/pagination';
import { ScenarioEntity } from '@/entities/scenario/domain/ScenarioEntity';
import { SubScenarioEntity } from '@/entities/sub-scenario/domain/SubScenarioEntity';
import { ActivityAreaEntity } from '@/entities/activity-area/domain/ActivityAreaEntity';
import { NeighborhoodEntity } from '@/entities/neighborhood/domain/NeighborhoodEntity';
import { FieldSurfaceTypeEntity } from '@/entities/field-surface-type/domain/FieldSurfaceTypeEntity';
import { GetScenariosUseCase } from '@/application/dashboard/scenarios/use-cases/GetScenariosUseCase';
import { GetNeighborhoodsUseCase } from '@/application/dashboard/scenarios/use-cases/GetNeighborhoodsUseCase';
import { GetActivityAreasUseCase } from '@/application/dashboard/activity-areas/use-cases/GetActivityAreasUseCase';
import { GetFieldSurfaceTypesUseCase } from '@/application/dashboard/field-surface-types/use-cases/GetFieldSurfaceTypesUseCase';
import { GetSubScenariosUseCase } from '@/application/dashboard/sub-scenarios/use-cases/GetSubScenariosUseCase';

export interface ISubScenariosDataResponse {
  subScenarios: SubScenarioEntity[]; // Domain entities
  scenarios: ScenarioEntity[]; // Domain entities
  activityAreas: ActivityAreaEntity[]; // Domain entities
  neighborhoods: NeighborhoodEntity[]; // Domain entities
  fieldSurfaceTypes: FieldSurfaceTypeEntity[]; // Domain entities
  meta: PageMeta;
  filters: SubScenariosFilters;
}

export class GetSubScenariosDataService {
  constructor(
    private readonly getScenariosUseCase: GetScenariosUseCase,
    private readonly getNeighborhoodsUseCase: GetNeighborhoodsUseCase,
    private readonly getActivityAreasUseCase: GetActivityAreasUseCase,
    private readonly getFieldSurfaceTypesUseCase: GetFieldSurfaceTypesUseCase,
    private readonly getSubScenariosUseCase: GetSubScenariosUseCase
  ) { }

  async execute(filters: SubScenariosFilters): Promise<ISubScenariosDataResponse> {
    try {
      // Default filters
      const defaultFilters: SubScenariosFilters = {
        page: 1,
        limit: 7,
        search: "",
        ...filters,
      };

      // Load all catalog data and sub-scenarios in parallel using use cases
      const [
        scenariosResult,
        activityAreasResult,
        neighborhoodsResult,
        fieldSurfaceTypesResult,
        subScenariosResult,
      ] = await Promise.all([
        this.getScenariosUseCase.execute({ limit: 100 }), // Returns PaginatedScenarios
        this.getActivityAreasUseCase.execute(), // Returns PaginatedActivityAreas
        this.getNeighborhoodsUseCase.execute(), // Returns PaginatedNeighborhoods
        this.getFieldSurfaceTypesUseCase.execute(), // Returns PaginatedFieldSurfaceTypes
        this.getSubScenariosUseCase.execute(defaultFilters), // Returns PaginatedSubScenarios
      ]);

      return {
        subScenarios: subScenariosResult.data,
        scenarios: scenariosResult.data,
        activityAreas: activityAreasResult.data,
        neighborhoods: neighborhoodsResult.data,
        fieldSurfaceTypes: fieldSurfaceTypesResult.data,
        meta: subScenariosResult.meta,
        filters: defaultFilters,
      };

    } catch (error) {
      console.error('Error in GetSubScenariosDataService:', error);
      throw error;
    }
  }
}

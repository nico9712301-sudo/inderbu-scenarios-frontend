import { GetSubScenariosUseCase } from '@/application/dashboard/sub-scenarios/use-cases/GetSubScenariosUseCase';
import { GetActivityAreasUseCase } from '@/application/dashboard/activity-areas/use-cases/GetActivityAreasUseCase';
import { GetNeighborhoodsUseCase } from '@/application/dashboard/scenarios/use-cases/GetNeighborhoodsUseCase';
import { GetFieldSurfaceTypesUseCase } from '@/application/dashboard/field-surface-types/use-cases/GetFieldSurfaceTypesUseCase';

import { SubScenarioEntity } from '@/entities/sub-scenario/domain/SubScenarioEntity';
import { ActivityAreaEntity } from '@/entities/activity-area/domain/ActivityAreaEntity';
import { NeighborhoodEntity } from '@/entities/neighborhood/domain/NeighborhoodEntity';
import { FieldSurfaceTypeEntity } from '@/entities/field-surface-type/domain/FieldSurfaceTypeEntity';
import { PageMeta } from '@/shared/api/pagination';

// Application Service Input
export interface HomeFilters {
  page?: number;
  limit?: number;
  search?: string;
  activityAreaId?: number;
  neighborhoodId?: number;
  hasCost?: boolean;
}

// Application Service Response (Domain Entities)
export interface IHomeDataResponse {
  subScenarios: SubScenarioEntity[];          // Main content entities
  activityAreas: ActivityAreaEntity[];        // Filter options
  neighborhoods: NeighborhoodEntity[];        // Filter options
  fieldSurfaceTypes: FieldSurfaceTypeEntity[]; // Filter options
  meta: PageMeta;                             // Pagination metadata from main content
  filters: HomeFilters;                       // Applied filters
}

/**
 * Home Data Application Service
 * 
 * Cross-domain orchestration service that coordinates multiple use cases
 * to provide complete data for the home page. Follows the same pattern
 * as GetSubScenariosDataService.
 */
export class GetHomeDataService {
  constructor(
    private readonly getSubScenariosUseCase: GetSubScenariosUseCase,
    private readonly getActivityAreasUseCase: GetActivityAreasUseCase,
    private readonly getNeighborhoodsUseCase: GetNeighborhoodsUseCase,
    private readonly getFieldSurfaceTypesUseCase: GetFieldSurfaceTypesUseCase
  ) {}

  async execute(filters: HomeFilters): Promise<IHomeDataResponse> {
    try {
      // Default filters for home page
      const defaultFilters: HomeFilters = {
        page: 1,
        limit: 12, // More items for home page grid
        search: "",
        ...filters,
      };

      // Load main content and filter options in parallel using use cases
      const [
        subScenariosResult,
        activityAreasResult,
        neighborhoodsResult,
        fieldSurfaceTypesResult,
      ] = await Promise.all([
        this.getSubScenariosUseCase.execute({
          page: defaultFilters.page,
          limit: defaultFilters.limit,
          search: defaultFilters.search,
          activityAreaId: defaultFilters.activityAreaId,
          neighborhoodId: defaultFilters.neighborhoodId,
          active: true, // Only show active scenarios on home
        }),
        this.getActivityAreasUseCase.execute({ active: true, limit: 100 }),
        this.getNeighborhoodsUseCase.execute({ active: true, limit: 100 }),
        this.getFieldSurfaceTypesUseCase.execute({ active: true, limit: 100 }),
      ]);

      // Extract domain entities from pagination wrappers
      return {
        subScenarios: subScenariosResult.data,           // SubScenarioEntity[]
        activityAreas: activityAreasResult.data,         // ActivityAreaEntity[]
        neighborhoods: neighborhoodsResult.data,         // NeighborhoodEntity[]
        fieldSurfaceTypes: fieldSurfaceTypesResult.data, // FieldSurfaceTypeEntity[]
        meta: subScenariosResult.meta,                   // PageMeta for main content
        filters: defaultFilters,                         // Applied filters
      };

    } catch (error) {
      console.error('Error in GetHomeDataService:', error);
      throw error;
    }
  }
}
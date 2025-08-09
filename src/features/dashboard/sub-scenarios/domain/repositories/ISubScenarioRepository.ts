import {
  SubScenario,
  Scenario,
  ActivityArea,
  Neighborhood,
  PageMeta,
} from '@/services/api';

export interface PaginatedSubScenarios {
  data: SubScenario[];
  meta: PageMeta;
}

export interface SubScenariosFilters {
  page?: number;
  limit?: number;
  search?: string;
  scenarioId?: number;
  activityAreaId?: number;
  neighborhoodId?: number;
  active?: boolean;
}

export interface ISubScenarioRepository {
  getAllWithPagination(filters: SubScenariosFilters): Promise<PaginatedSubScenarios>;
  create(data: Omit<SubScenario, "id"> & { images?: any[] }): Promise<SubScenario>;
  update(id: number, data: Partial<SubScenario>): Promise<SubScenario>;
}

export interface IScenarioRepository {
  getAllWithLimit(limit: number): Promise<Scenario[]>;
}

export interface IActivityAreaRepository {
  getAll(): Promise<ActivityArea[]>;
}

export interface INeighborhoodRepository {
  getAll(): Promise<Neighborhood[]>;
}

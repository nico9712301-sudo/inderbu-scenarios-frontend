import { IScenariosFilters, PaginatedScenarios } from '@/presentation/features/dashboard/scenarios/domain/repositories/IScenarioRepository';
import { IActivityAreaRepository } from '@/entities/activity-area/domain/IActivityAreaRepository';
import { INeighborhoodRepository } from '@/entities/neighborhood/domain/INeighborhoodRepository';
import {
  SubScenario,
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
  getAllWithPagination(filters: IScenariosFilters): Promise<PaginatedScenarios>
}

// ❌ REMOVIDAS: Estas interfaces no pertenecen aquí
// export interface IActivityAreaRepository {
//   getAll(): Promise<ActivityArea[]>;
// }

// export interface INeighborhoodRepository {
//   getAll(): Promise<Neighborhood[]>;
// }

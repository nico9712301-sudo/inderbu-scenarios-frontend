import { SubScenarioEntity } from '@/entities/sub-scenario/domain/SubScenarioEntity';
import { PageMetaDto } from '@/shared/api';

export interface SubScenariosFilters {
  search?: string;
  scenarioId?: number;
  activityAreaId?: number;
  neighborhoodId?: number;
  fieldSurfaceTypeId?: number;
  hasCost?: boolean;
  active?: boolean;
  limit?: number;
  page?: number;
}

export interface PaginatedSubScenarios {
  data: SubScenarioEntity[];
  meta: PageMetaDto;
}

export interface SubScenarioStatsFilters {
  active?: boolean;
}

export interface SubScenarioStats {
  count: number;
}

export interface ISubScenarioRepository {
  getAll(filters?: SubScenariosFilters): Promise<PaginatedSubScenarios>;
  getById(id: number): Promise<SubScenarioEntity | null>;
  create(data: Omit<SubScenarioEntity, "id"> & { images?: any[] }): Promise<SubScenarioEntity>;
  update(id: number, data: Partial<SubScenarioEntity>): Promise<SubScenarioEntity>;
  updateActiveStatus(id: number, active: boolean): Promise<SubScenarioEntity>;
  delete(id: number): Promise<void>;
  getStats(filters?: SubScenarioStatsFilters): Promise<SubScenarioStats>;
}


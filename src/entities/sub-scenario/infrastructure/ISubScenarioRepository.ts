import { SubScenarioEntity, SubScenarioSearchCriteria } from '@/entities/sub-scenario/domain/SubScenarioEntity';
import { PageMeta } from '@/services/api';

export interface SubScenariosFilters {
  search?: string;
  scenarioId?: number;
  activityAreaId?: number;
  neighborhoodId?: number;
  active?: boolean;
  limit?: number;
  page?: number;
}

export interface PaginatedSubScenarios {
  data: SubScenarioEntity[];
  meta: PageMeta;
}

export interface ISubScenarioRepository {
  getAll(filters?: SubScenariosFilters): Promise<PaginatedSubScenarios>;
  getById(id: number): Promise<SubScenarioEntity | null>;
  create(data: Omit<SubScenarioEntity, "id"> & { images?: any[] }): Promise<SubScenarioEntity>;
  update(id: number, data: Partial<SubScenarioEntity>): Promise<SubScenarioEntity>;
  delete(id: number): Promise<void>;
}


import { PageMeta } from '@/services/api';
import { ScenarioEntity, ScenarioSearchCriteria } from '../domain/ScenarioEntity';

export interface ScenarioFilters {
  page?: number;
  limit?: number;
  search?: string;
  neighborhoodId?: number;
  active?: boolean;
}

export interface PaginatedScenarios {
  data: ScenarioEntity[];
  meta: PageMeta;
}

export interface IScenarioRepository {
  getAll(filters?: ScenarioFilters): Promise<PaginatedScenarios>;
  getById(id: number): Promise<ScenarioEntity | null>;
  search(criteria: ScenarioSearchCriteria): Promise<ScenarioEntity[]>;
  create(data: Omit<ScenarioEntity, 'id'>): Promise<ScenarioEntity>;
  update(id: number, data: Partial<ScenarioEntity>): Promise<ScenarioEntity>;
  delete(id: number): Promise<void>;
}

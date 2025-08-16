import { PageMetaDto } from '@/shared/api';
import { ScenarioEntity } from '../domain/ScenarioEntity';

export interface ScenarioFilters {
  page?: number;
  limit?: number;
  search?: string;
  neighborhoodId?: number;
  active?: boolean;
}

export interface PaginatedScenarios {
  data: ScenarioEntity[];
  meta: PageMetaDto;
}

export interface IScenarioRepository {
  getAll(filters?: ScenarioFilters): Promise<PaginatedScenarios>;
  getById(id: number): Promise<ScenarioEntity | null>;
  create(data: Omit<ScenarioEntity, 'id'>): Promise<ScenarioEntity>;
  update(id: number, data: Partial<ScenarioEntity>): Promise<ScenarioEntity>;
  delete(id: number): Promise<void>;
}

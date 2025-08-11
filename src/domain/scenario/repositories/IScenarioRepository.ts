import { PageMeta } from '@/services/api';
import { Scenario, CreateScenarioData, UpdateScenarioData } from '../entities/Scenario';

export interface ScenarioFilters {
  page?: number;
  limit?: number;
  search?: string;
  neighborhoodId?: number;
  active?: boolean;
}

export interface PaginatedScenarios {
  data: Scenario[];
  meta: PageMeta;
}

export interface IScenarioRepository {
  findAll(): Promise<Scenario[]>;
  findWithPagination(filters: ScenarioFilters): Promise<PaginatedScenarios>;
  findById(id: number): Promise<Scenario | null>;
  create(data: CreateScenarioData): Promise<Scenario>;
  update(id: number, data: UpdateScenarioData): Promise<Scenario>;
  delete(id: number): Promise<void>;
  getAllWithLimit(limit: number): Promise<Scenario[]>;
}

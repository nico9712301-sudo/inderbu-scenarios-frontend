import { Scenario, Neighborhood, CreateScenarioDto, UpdateScenarioDto, PageMeta } from '@/services/api';

export interface PaginatedScenarios {
  data: Scenario[];
  meta: PageMeta;
}

export interface IScenariosFilters {
  page?: number;
  limit?: number;
  search?: string;
  neighborhoodId?: number;
}

export interface IScenarioRepository {
  getAllWithPagination(filters: IScenariosFilters): Promise<PaginatedScenarios>;
  create(data: CreateScenarioDto): Promise<Scenario>;
  update(id: number, data: UpdateScenarioDto): Promise<Scenario>;
}

export interface INeighborhoodRepository {
  getAll(): Promise<Neighborhood[]>;
}

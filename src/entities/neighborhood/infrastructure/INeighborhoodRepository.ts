import { NeighborhoodEntity, NeighborhoodSearchCriteria } from '../domain/NeighborhoodEntity';
import { PageMeta } from '@/shared/api/pagination';

export interface NeighborhoodFilters {
  page?: number;
  limit?: number;
  search?: string;
  communeId?: number;
  active?: boolean;
}

export interface PaginatedNeighborhoods {
  data: NeighborhoodEntity[];
  meta: PageMeta;
}

// Clean repository interface working only with Domain Entities
export interface INeighborhoodRepository {
  getAll(filters?: NeighborhoodFilters): Promise<PaginatedNeighborhoods>;
  getById(id: number): Promise<NeighborhoodEntity | null>;
  search(criteria: NeighborhoodSearchCriteria): Promise<NeighborhoodEntity[]>;
  findByCommuneId(communeId: number): Promise<NeighborhoodEntity[]>;
  create(data: Omit<NeighborhoodEntity, 'id'>): Promise<NeighborhoodEntity>;
  update(id: number, data: Partial<NeighborhoodEntity>): Promise<NeighborhoodEntity>;
  delete(id: number): Promise<void>;
}

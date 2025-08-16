import { PageMetaDto } from '@/shared/api';
import { NeighborhoodEntity, NeighborhoodSearchCriteria } from '../domain/NeighborhoodEntity';

export interface NeighborhoodFilters {
  page?: number;
  limit?: number;
  search?: string;
  communeId?: number;
  active?: boolean;
}

export interface PaginatedNeighborhoods {
  data: NeighborhoodEntity[];
  meta: PageMetaDto;
}

// Clean repository interface working only with Domain Entities
export interface INeighborhoodRepository {
  getAll(filters?: NeighborhoodFilters): Promise<PaginatedNeighborhoods>;
  getById(id: number): Promise<NeighborhoodEntity | null>;
  create(data: Omit<NeighborhoodEntity, 'id'>): Promise<NeighborhoodEntity>;
  update(id: number, data: Partial<NeighborhoodEntity>): Promise<NeighborhoodEntity>;
  delete(id: number): Promise<void>;
}

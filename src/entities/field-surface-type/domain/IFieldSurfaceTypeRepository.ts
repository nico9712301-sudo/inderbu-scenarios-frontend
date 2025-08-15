import { FieldSurfaceTypeEntity, FieldSurfaceTypeSearchCriteria } from './FieldSurfaceTypeEntity';
import { PageMeta } from '@/shared/api/pagination';

export interface FieldSurfaceTypeFilters {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}

export interface PaginatedFieldSurfaceTypes {
  data: FieldSurfaceTypeEntity[];
  meta: PageMeta;
}

// Clean repository interface working only with Domain Entities
export interface IFieldSurfaceTypeRepository {
  getAll(filters?: FieldSurfaceTypeFilters): Promise<PaginatedFieldSurfaceTypes>;
  getById(id: number): Promise<FieldSurfaceTypeEntity | null>;
  search(criteria: FieldSurfaceTypeSearchCriteria): Promise<FieldSurfaceTypeEntity[]>;
  create(data: Omit<FieldSurfaceTypeEntity, 'id'>): Promise<FieldSurfaceTypeEntity>;
  update(id: number, data: Partial<FieldSurfaceTypeEntity>): Promise<FieldSurfaceTypeEntity>;
  delete(id: number): Promise<void>;
}
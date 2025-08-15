import { ActivityAreaEntity, ActivityAreaSearchCriteria } from './ActivityAreaEntity';
import { PageMeta } from '@/shared/api/pagination';

export interface ActivityAreaFilters {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}

export interface PaginatedActivityAreas {
  data: ActivityAreaEntity[];
  meta: PageMeta;
}

// Clean repository interface working only with Domain Entities
export interface IActivityAreaRepository {
  getAll(filters?: ActivityAreaFilters): Promise<PaginatedActivityAreas>;
  getById(id: number): Promise<ActivityAreaEntity | null>;
  search(criteria: ActivityAreaSearchCriteria): Promise<ActivityAreaEntity[]>;
  create(data: Omit<ActivityAreaEntity, 'id'>): Promise<ActivityAreaEntity>;
  update(id: number, data: Partial<ActivityAreaEntity>): Promise<ActivityAreaEntity>;
  delete(id: number): Promise<void>;
}

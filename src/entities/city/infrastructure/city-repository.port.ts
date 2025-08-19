import { PageMetaDto } from '@/shared/api';
import { CityEntity } from '../domain/CityEntity';

export interface CityFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedCities {
  data: CityEntity[];
  meta: PageMetaDto;
}

export interface ICityRepository {
  getAll(filters?: CityFilters): Promise<CityEntity[]>;
  getById(id: number): Promise<CityEntity | null>;
  create(data: Omit<CityEntity, 'id'>): Promise<CityEntity>;
  update(id: number, data: Partial<CityEntity>): Promise<CityEntity>;
  delete(id: number): Promise<void>;
}
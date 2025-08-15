import { Commune, Neighborhood } from '@/shared/api/domain-types';
import { CreateCommuneDto, CreateNeighborhoodDto, UpdateCommuneDto, UpdateNeighborhoodDto } from '@/shared/api/dto-types';
import { PageMeta } from '@/shared/api/pagination';

// City entity (for communes)
export interface City {
  id: number;
  name: string;
}

// Paginated results
export interface PaginatedCommunes {
  data: Commune[];
  meta: PageMeta;
}

export interface PaginatedNeighborhoods {
  data: Neighborhood[];
  meta: PageMeta;
}

// Filters
export interface CommuneFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface NeighborhoodFilters {
  page?: number;
  limit?: number;
  search?: string;
}

// Repository interfaces
export interface ICommuneRepository {
  getAll(filters?: CommuneFilters): Promise<PaginatedCommunes>;
  getAllSimple(): Promise<Commune[]>;
  create(data: CreateCommuneDto): Promise<Commune>;
  update(id: number, data: UpdateCommuneDto): Promise<Commune>;
}

export interface ICityRepository {
  getAll(): Promise<City[]>;
}

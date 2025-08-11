import { 
  Commune, 
  Neighborhood, 
  CreateCommuneDto, 
  CreateNeighborhoodDto, 
  UpdateCommuneDto, 
  UpdateNeighborhoodDto, 
  PageMeta 
} from '@/services/api';

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
  getAllWithPagination(filters: CommuneFilters): Promise<PaginatedCommunes>;
  getAll(): Promise<Commune[]>;
  create(data: CreateCommuneDto): Promise<Commune>;
  update(id: number, data: UpdateCommuneDto): Promise<Commune>;
}

export interface INeighborhoodRepository {
  getAllWithPagination(filters: NeighborhoodFilters): Promise<PaginatedNeighborhoods>;
  getAll(): Promise<Neighborhood[]>;
  create(data: CreateNeighborhoodDto): Promise<Neighborhood>;
  update(id: number, data: UpdateNeighborhoodDto): Promise<Neighborhood>;
}

export interface ICityRepository {
  getAll(): Promise<City[]>;
}

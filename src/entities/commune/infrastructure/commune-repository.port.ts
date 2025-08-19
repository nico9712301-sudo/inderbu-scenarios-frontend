import { PageMetaDto } from '@/shared/api';
import { CommuneEntity } from '../domain/CommuneEntity';

export interface CommuneFilters {
  page?: number;
  limit?: number;
  search?: string;
  cityId?: number;
}

export interface PaginatedCommunes {
  data: CommuneEntity[];
  meta: PageMetaDto;
}

export interface ICommuneRepository {
  getAll(filters?: CommuneFilters): Promise<PaginatedCommunes>;
  getAllSimple(): Promise<CommuneEntity[]>;
  getById(id: number): Promise<CommuneEntity | null>;
  create(data: Omit<CommuneEntity, 'id'>): Promise<CommuneEntity>;
  update(id: number, data: Partial<CommuneEntity>): Promise<CommuneEntity>;
  delete(id: number): Promise<void>;
}
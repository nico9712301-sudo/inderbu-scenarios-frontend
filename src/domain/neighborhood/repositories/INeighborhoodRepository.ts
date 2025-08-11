import { Neighborhood, CreateNeighborhoodData, UpdateNeighborhoodData } from '../entities/Neighborhood';

export interface NeighborhoodFilters {
  communeId?: number;
  search?: string;
}

export interface INeighborhoodRepository {
  findAll(filters?: NeighborhoodFilters): Promise<Neighborhood[]>;
  findById(id: number): Promise<Neighborhood | null>;
  findByCommuneId(communeId: number): Promise<Neighborhood[]>;
  create(data: CreateNeighborhoodData): Promise<Neighborhood>;
  update(id: number, data: UpdateNeighborhoodData): Promise<Neighborhood>;
  delete(id: number): Promise<void>;
}

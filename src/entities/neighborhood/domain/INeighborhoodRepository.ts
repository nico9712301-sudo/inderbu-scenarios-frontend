import { Neighborhood } from '@/services/api';

export interface INeighborhoodRepository {
  getAll(): Promise<Neighborhood[]>;
  getById(id: number): Promise<Neighborhood | null>;
  getByCommuneId(communeId: number): Promise<Neighborhood[]>;
  create(data: Omit<Neighborhood, 'id'>): Promise<Neighborhood>;
  update(id: number, data: Partial<Neighborhood>): Promise<Neighborhood>;
  delete(id: number): Promise<void>;
}

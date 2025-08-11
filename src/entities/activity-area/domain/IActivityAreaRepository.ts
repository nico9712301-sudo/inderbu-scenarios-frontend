import { ActivityArea } from '@/services/api';

export interface IActivityAreaRepository {
  getAll(): Promise<ActivityArea[]>;
  getById(id: number): Promise<ActivityArea | null>;
  create(data: Omit<ActivityArea, 'id'>): Promise<ActivityArea>;
  update(id: number, data: Partial<ActivityArea>): Promise<ActivityArea>;
  delete(id: number): Promise<void>;
}

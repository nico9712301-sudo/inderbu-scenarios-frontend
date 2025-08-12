// Infrastructure: Activity Area Repository Adapter (bridges existing API to domain interface)

import { IActivityAreaRepository } from '@/entities/activity-area/domain/IActivityAreaRepository';
import { ActivityArea } from '@/services/api';

// Existing API interface (what currently exists)
interface ActivityAreaApiService {
  getActivityAreas(): Promise<ActivityArea[]>;
}

// Infrastructure: Adapter Pattern - Bridge existing API to domain interface
export class ActivityAreaRepositoryAdapter implements IActivityAreaRepository {
  constructor(private readonly apiService: ActivityAreaApiService) { }

  async getAll(): Promise<ActivityArea[]> {

    try {
      // Call existing API service
      const result = await this.apiService.getActivityAreas();
      return result;

    } catch (error) {
      console.error('ActivityAreaRepositoryAdapter: Error in findAll:', error);
      throw error; // Re-throw to let domain handle it
    }
  }

  async getById(id: number): Promise<ActivityArea | null> {
    try {
      const allActivityAreas = await this.getAll();
      const found = allActivityAreas.find(area => +area.id === id);

      return found || null;

    } catch (error) {
      console.error('ActivityAreaRepositoryAdapter: Error in findById:', error);
      throw error;
    }
  }

  async create(data: Omit<ActivityArea, 'id'>): Promise<ActivityArea> {
    throw new Error('Create not implemented');
  }

  async update(id: number, data: Partial<ActivityArea>): Promise<ActivityArea> {
    throw new Error('Update not implemented');
  }

  async delete(id: number): Promise<void> {
    throw new Error('Delete not implemented');
  }

  // Additional helper methods
  async findByName(name: string): Promise<ActivityArea[]> {
    try {
      const allActivityAreas = await this.getAll();
      const filtered = allActivityAreas.filter(area =>
        area.name.toLowerCase().includes(name.toLowerCase())
      );

      return filtered;

    } catch (error) {
      console.error('ActivityAreaRepositoryAdapter: Error in findByName:', error);
      throw error;
    }
  }
}

// Factory function for DI container
export function createActivityAreaRepositoryAdapter(apiService: ActivityAreaApiService): IActivityAreaRepository {
  return new ActivityAreaRepositoryAdapter(apiService);
}

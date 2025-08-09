// Infrastructure: Activity Area Repository Adapter (bridges existing API to domain interface)

import { ActivityAreaRepository } from '@/entities/activity-area/domain/activity-area.domain';
import { IActivityArea } from '@/features/home/types/filters.types';

// Existing API interface (what currently exists)
interface ActivityAreaApiService {
  getActivityAreas(): Promise<IActivityArea[]>;
}

// Infrastructure: Adapter Pattern - Bridge existing API to domain interface
export class ActivityAreaRepositoryAdapter implements ActivityAreaRepository {
  constructor(private readonly apiService: ActivityAreaApiService) { }

  async findAll(): Promise<IActivityArea[]> {

    try {
      // Call existing API service
      const result = await this.apiService.getActivityAreas();
      return result;

    } catch (error) {
      console.error('ActivityAreaRepositoryAdapter: Error in findAll:', error);
      throw error; // Re-throw to let domain handle it
    }
  }

  async findById(id: number): Promise<IActivityArea | null> {
    try {
      const allActivityAreas = await this.findAll();
      const found = allActivityAreas.find(area => +area.id === id);

      return found || null;

    } catch (error) {
      console.error('ActivityAreaRepositoryAdapter: Error in findById:', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<IActivityArea[]> {
    try {
      const allActivityAreas = await this.findAll();
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
export function createActivityAreaRepositoryAdapter(apiService: ActivityAreaApiService): ActivityAreaRepository {
  return new ActivityAreaRepositoryAdapter(apiService);
}

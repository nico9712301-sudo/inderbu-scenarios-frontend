// Infrastructure: Neighborhood Repository Adapter (bridges existing API to domain interface)

import { NeighborhoodRepository } from '@/entities/neighborhood/domain/neighborhood.domain';
import { INeighborhood } from "@/features/auth/interfaces/neighborhood.interface";

// Existing API interface (what currently exists)
interface NeighborhoodApiService {
  getNeighborhoods(): Promise<INeighborhood[]>;
}

// Infrastructure: Adapter Pattern - Bridge existing API to domain interface  
export class NeighborhoodRepositoryAdapter implements NeighborhoodRepository {
  constructor(private readonly apiService: NeighborhoodApiService) {}

  async findAll(): Promise<INeighborhood[]> {

    try {
      // Call existing API service
      const result = await this.apiService.getNeighborhoods();
      
      return result;

    } catch (error) {
      console.error('NeighborhoodRepositoryAdapter: Error in findAll:', error);
      throw error; // Re-throw to let domain handle it
    }
  }

  async findById(id: number): Promise<INeighborhood | null> {

    try {
      const allNeighborhoods = await this.findAll();
      const found = allNeighborhoods.find(neighborhood => neighborhood.id === id);
      
      return found || null;

    } catch (error) {
      console.error('NeighborhoodRepositoryAdapter: Error in findById:', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<INeighborhood[]> {
    try {
      const allNeighborhoods = await this.findAll();
      const filtered = allNeighborhoods.filter(neighborhood => 
        neighborhood.name.toLowerCase().includes(name.toLowerCase())
      );
      
      return filtered;

    } catch (error) {
      console.error('NeighborhoodRepositoryAdapter: Error in findByName:', error);
      throw error;
    }
  }
}

// Factory function for DI container
export function createNeighborhoodRepositoryAdapter(apiService: NeighborhoodApiService): NeighborhoodRepository {
  return new NeighborhoodRepositoryAdapter(apiService);
}

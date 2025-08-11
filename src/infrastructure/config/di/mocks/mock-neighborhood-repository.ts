import { injectable } from 'inversify';
import { 
  INeighborhoodRepository, 
  NeighborhoodFilters 
} from '@/domain/neighborhood/repositories/INeighborhoodRepository';
import { Neighborhood, CreateNeighborhoodData, UpdateNeighborhoodData } from '@/domain/neighborhood/entities/Neighborhood';

/**
 * Mock Neighborhood Repository for Testing
 * 
 * In-memory implementation of INeighborhoodRepository for isolated testing.
 * Provides predictable data and behavior for unit tests.
 */
@injectable()
export class MockNeighborhoodRepository implements INeighborhoodRepository {
  private neighborhoods: Neighborhood[] = [];
  private nextId = 1;

  constructor() {
    // Initialize with some test data
    this.seedTestData();
  }

  private seedTestData(): void {
    this.neighborhoods = [
      {
        id: 1,
        name: 'Test Neighborhood 1',
        // communeId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Test Neighborhood 2',
        // communeId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        name: 'Test Neighborhood 3',
        // communeId: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    this.nextId = 4;
  }

  async findAll(filters: NeighborhoodFilters = {}): Promise<Neighborhood[]> {
    let filtered = [...this.neighborhoods];

    // Apply filters
    if (filters.communeId) {
      filtered = filtered.filter(neighborhood => neighborhood.commune?.id === filters.communeId);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(neighborhood => 
        neighborhood.name.toLowerCase().includes(searchLower)
      );
    }

    return filtered.map(n => ({ ...n })); // Return copies
  }

  async findById(id: number): Promise<Neighborhood | null> {
    const neighborhood = this.neighborhoods.find(n => n.id === id);
    return neighborhood ? { ...neighborhood } : null; // Return copy
  }

  async findByCommuneId(communeId: number): Promise<Neighborhood[]> {
    return this.findAll({ communeId });
  }

  async create(data: CreateNeighborhoodData): Promise<Neighborhood> {
    const newNeighborhood: Neighborhood = {
      id: this.nextId++,
      name: data.name,
    //   commune: data.communeId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.neighborhoods.push(newNeighborhood);
    return { ...newNeighborhood }; // Return copy
  }

  async update(id: number, data: UpdateNeighborhoodData): Promise<Neighborhood> {
    const index = this.neighborhoods.findIndex(n => n.id === id);
    if (index === -1) {
      throw new Error(`Neighborhood with id ${id} not found`);
    }

    const existingNeighborhood = this.neighborhoods[index];
    const updatedNeighborhood: Neighborhood = {
      ...existingNeighborhood,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.communeId !== undefined && { communeId: data.communeId }),
      updatedAt: new Date().toISOString(),
    };

    this.neighborhoods[index] = updatedNeighborhood;
    return { ...updatedNeighborhood }; // Return copy
  }

  async delete(id: number): Promise<void> {
    const index = this.neighborhoods.findIndex(n => n.id === id);
    if (index === -1) {
      throw new Error(`Neighborhood with id ${id} not found`);
    }
    
    this.neighborhoods.splice(index, 1);
  }

  // =========================================================================
  // TEST UTILITIES
  // =========================================================================

  /**
   * Reset repository to initial state (useful for test setup)
   */
  reset(): void {
    this.seedTestData();
  }

  /**
   * Get current count of neighborhoods (useful for testing)
   */
  getCount(): number {
    return this.neighborhoods.length;
  }

  /**
   * Add neighborhood directly (useful for test setup)
   */
  addNeighborhood(neighborhood: Omit<Neighborhood, 'id' | 'createdAt' | 'updatedAt'>): Neighborhood {
    const newNeighborhood: Neighborhood = {
      ...neighborhood,
      id: this.nextId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.neighborhoods.push(newNeighborhood);
    return { ...newNeighborhood };
  }

  /**
   * Clear all neighborhoods (useful for testing)
   */
  clear(): void {
    this.neighborhoods = [];
    this.nextId = 1;
  }

  /**
   * Get neighborhoods by commune (test utility)
   */
  getNeighborhoodsByCommune(communeId: number): Neighborhood[] {
    return this.neighborhoods
      .filter(n => n.commune?.id === communeId)
      .map(n => ({ ...n }));
  }
}

/**
 * Factory function to create a fresh mock neighborhood repository
 */
export function createMockNeighborhoodRepository(): MockNeighborhoodRepository {
  return new MockNeighborhoodRepository();
}

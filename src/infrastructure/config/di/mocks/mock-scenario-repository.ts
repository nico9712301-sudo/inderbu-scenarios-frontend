import { 
  IScenarioRepository, 
  ScenarioFilters, 
  PaginatedScenarios 
} from '@/domain/scenario/repositories/IScenarioRepository';
import { Scenario, CreateScenarioData, UpdateScenarioData } from '@/domain/scenario/entities/Scenario';
import { injectable } from 'inversify';

/**
 * Mock Scenario Repository for Testing
 * 
 * In-memory implementation of IScenarioRepository for isolated testing.
 * Provides predictable data and behavior for unit tests.
 */
@injectable()
export class MockScenarioRepository implements IScenarioRepository {
  private scenarios: Scenario[] = [];
  private nextId = 1;

  constructor() {
    // Initialize with some test data
    this.seedTestData();
  }

  private seedTestData(): void {
    this.scenarios = [
      {
        id: 1,
        name: 'Test Scenario 1',
        address: '123 Test Street',
        description: 'A test scenario for unit testing',
        neighborhoodId: 1,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Test Scenario 2',
        address: '456 Mock Avenue',
        description: 'Another test scenario',
        neighborhoodId: 2,
        active: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        name: 'Test Scenario 3',
        address: '789 Testing Blvd',
        neighborhoodId: 1,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    this.nextId = 4;
  }

  async findAll(): Promise<Scenario[]> {
    return [...this.scenarios]; // Return copy to prevent external mutations
  }

  async findWithPagination(filters: ScenarioFilters): Promise<PaginatedScenarios> {
    let filtered = [...this.scenarios];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(scenario => 
        scenario.name.toLowerCase().includes(searchLower) ||
        scenario.address.toLowerCase().includes(searchLower) ||
        (scenario.description && scenario.description.toLowerCase().includes(searchLower))
      );
    }

    if (filters.neighborhoodId) {
      filtered = filtered.filter(scenario => scenario.neighborhoodId === filters.neighborhoodId);
    }

    if (filters.active !== undefined) {
      filtered = filtered.filter(scenario => scenario.active === filters.active);
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 7;
    const offset = (page - 1) * limit;
    const paginatedData = filtered.slice(offset, offset + limit);

    return {
      data: paginatedData,
      meta: {
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
        page,
        limit,
        hasNextPage: offset + limit < filtered.length,
        hasPreviousPage: offset > 0,
      },
    };
  }

  async findById(id: number): Promise<Scenario | null> {
    const scenario = this.scenarios.find(s => s.id === id);
    return scenario ? { ...scenario } : null; // Return copy
  }

  async create(data: CreateScenarioData): Promise<Scenario> {
    const newScenario: Scenario = {
      id: this.nextId++,
      name: data.name,
      address: data.address,
      neighborhoodId: data.neighborhoodId,
      active: true, // New scenarios are active by default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.scenarios.push(newScenario);
    return { ...newScenario }; // Return copy
  }

  async update(id: number, data: UpdateScenarioData): Promise<Scenario> {
    const index = this.scenarios.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Scenario with id ${id} not found`);
    }

    const existingScenario = this.scenarios[index];
    const updatedScenario: Scenario = {
      ...existingScenario,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.neighborhoodId !== undefined && { neighborhoodId: data.neighborhoodId }),
      ...(data.active !== undefined && { active: data.active }),
      updatedAt: new Date().toISOString(),
    };

    this.scenarios[index] = updatedScenario;
    return { ...updatedScenario }; // Return copy
  }

  async delete(id: number): Promise<void> {
    const index = this.scenarios.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Scenario with id ${id} not found`);
    }
    
    this.scenarios.splice(index, 1);
  }

  async getAllWithLimit(limit: number): Promise<Scenario[]> {
    return this.scenarios.slice(0, limit).map(s => ({ ...s })); // Return copies
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
   * Get current count of scenarios (useful for testing)
   */
  getCount(): number {
    return this.scenarios.length;
  }

  /**
   * Add scenario directly (useful for test setup)
   */
  addScenario(scenario: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt'>): Scenario {
    const newScenario: Scenario = {
      ...scenario,
      id: this.nextId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.scenarios.push(newScenario);
    return { ...newScenario };
  }

  /**
   * Clear all scenarios (useful for testing)
   */
  clear(): void {
    this.scenarios = [];
    this.nextId = 1;
  }
}

/**
 * Factory function to create a fresh mock scenario repository
 */
export function createMockScenarioRepository(): MockScenarioRepository {
  return new MockScenarioRepository();
}

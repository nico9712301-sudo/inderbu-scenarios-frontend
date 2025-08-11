import { ScenarioContainer } from './scenario.container';
import { TYPES } from '../types';
import { IScenarioRepository } from '@/domain/scenario/repositories/IScenarioRepository';
import { INeighborhoodRepository } from '@/domain/neighborhood/repositories/INeighborhoodRepository';
import { MockScenarioRepository } from '../mocks/mock-scenario-repository';
import { MockNeighborhoodRepository } from '../mocks/mock-neighborhood-repository';

/**
 * Testing Container
 * 
 * Extends the base ScenarioContainer with test-specific configurations:
 * - Mock implementations for external dependencies
 * - Test doubles and stubs
 * - Isolated testing environment
 */
export class TestingContainer extends ScenarioContainer {
  
  protected configureContainer(): void {
    // Configure base dependencies first
    super.configureContainer();
    
    // Override with test-specific implementations
    this.configureTestingOverrides();
  }

  /**
   * Override dependencies with test doubles and mocks
   */
  private configureTestingOverrides(): void {
    // Override repositories with mock implementations
    this.container.rebind<IScenarioRepository>(TYPES.IScenarioRepository)
      .to(MockScenarioRepository)
      .inSingletonScope(); // Singleton for consistent test data
    
    this.container.rebind<INeighborhoodRepository>(TYPES.INeighborhoodRepository)
      .to(MockNeighborhoodRepository)
      .inSingletonScope(); // Singleton for consistent test data
    
    // TODO: Add other mock services when available
    // Override HTTP client with test double
    // this.container.rebind<IHttpClient>(TYPES.HttpClient)
    //   .toConstantValue(createMockHttpClient());
    
    // Override external services with test stubs
    // this.container.rebind<IExternalService>(TYPES.ExternalService)
    //   .toConstantValue(createStubExternalService());
  }

  protected onContainerConfigured(): void {
    // Skip validation in test environment for faster test execution
    // Tests should validate dependencies explicitly when needed
    
    if (process.env.DEBUG_TEST_CONTAINER === 'true') {
      console.log('🧪 Testing Container initialized with mocks');
      console.log('📊 Test Container Health:', this.getHealthStatus());
    }
  }

  // =========================================================================
  // TESTING-SPECIFIC UTILITIES
  // =========================================================================

  /**
   * Reset all mock repositories to their initial state
   */
  resetMocks(): void {
    const scenarioRepo = this.get<MockScenarioRepository>(TYPES.IScenarioRepository as any);
    const neighborhoodRepo = this.get<MockNeighborhoodRepository>(TYPES.INeighborhoodRepository as any);
    
    scenarioRepo.reset();
    neighborhoodRepo.reset();
    
    if (process.env.DEBUG_TEST_CONTAINER === 'true') {
      console.log('🔄 All mocks reset to initial state');
    }
  }

  /**
   * Get mock scenario repository for test setup
   */
  getMockScenarioRepository(): MockScenarioRepository {
    return this.get<MockScenarioRepository>(TYPES.IScenarioRepository as any);
  }

  /**
   * Get mock neighborhood repository for test setup
   */
  getMockNeighborhoodRepository(): MockNeighborhoodRepository {
    return this.get<MockNeighborhoodRepository>(TYPES.INeighborhoodRepository as any);
  }

  /**
   * Reset all transient dependencies (useful between tests)
   */
  resetTransientDependencies(): void {
    // Reset mocks
    this.resetMocks();
    
    // Transient dependencies are automatically recreated,
    // but we can explicitly clear any cached state if needed
    
    if (process.env.DEBUG_TEST_CONTAINER === 'true') {
      console.log('🔄 Resetting transient dependencies');
    }
  }

  /**
   * Replace a dependency with a test double
   * Useful for individual test customization
   */
  replaceWithMock<T>(identifier: symbol, mockImplementation: T): void {
    this.container.rebind<T>(identifier as any)
      .toConstantValue(mockImplementation);
  }

  /**
   * Restore original binding after mock replacement
   */
  restoreOriginal<T>(identifier: symbol, originalImplementation: any): void {
    this.container.rebind<T>(identifier as any)
      .to(originalImplementation);
  }

  /**
   * Get test data summary for debugging
   */
  getTestDataSummary(): TestDataSummary {
    const scenarioRepo = this.getMockScenarioRepository();
    const neighborhoodRepo = this.getMockNeighborhoodRepository();
    
    return {
      scenarios: {
        count: scenarioRepo.getCount(),
        active: 0, // TODO: Calculate from mock data
        inactive: 0, // TODO: Calculate from mock data
      },
      neighborhoods: {
        count: neighborhoodRepo.getCount(),
      },
      timestamp: new Date().toISOString(),
    };
  }
}

// =============================================================================
// TEST HELPER FUNCTIONS
// =============================================================================

/**
 * Create a fresh testing container for each test suite
 */
export function createTestContainer(): TestingContainer {
  return new TestingContainer();
}

/**
 * Test utility to verify dependency bindings
 */
export function verifyDependencyBinding(container: TestingContainer, identifier: symbol): boolean {
  return container.isBound(identifier);
}

/**
 * Test utility to get dependency without throwing (returns null if not found)
 */
export function safeGetDependency<T>(container: TestingContainer, identifier: symbol): T | null {
  try {
    return container.get<T>(identifier as any);
  } catch {
    return null;
  }
}

/**
 * Setup test data in container (useful for integration tests)
 */
export function setupTestData(container: TestingContainer, options: TestDataOptions = {}): void {
  const scenarioRepo = container.getMockScenarioRepository();
  const neighborhoodRepo = container.getMockNeighborhoodRepository();
  
  // Clear existing data if requested
  if (options.clearExisting) {
    scenarioRepo.clear();
    neighborhoodRepo.clear();
  }
  
  // Add custom scenarios
  if (options.scenarios) {
    options.scenarios.forEach(scenario => {
      scenarioRepo.addScenario(scenario);
    });
  }
  
  // Add custom neighborhoods
  if (options.neighborhoods) {
    options.neighborhoods.forEach(neighborhood => {
      neighborhoodRepo.addNeighborhood(neighborhood);
    });
  }
}

// =============================================================================
// TYPES
// =============================================================================

export interface TestDataSummary {
  scenarios: {
    count: number;
    active: number;
    inactive: number;
  };
  neighborhoods: {
    count: number;
  };
  timestamp: string;
}

export interface TestDataOptions {
  clearExisting?: boolean;
  scenarios?: Array<{
    name: string;
    address: string;
    description?: string;
    neighborhoodId: number;
    active?: boolean;
  }>;
  neighborhoods?: Array<{
    name: string;
    communeId: number;
  }>;
}

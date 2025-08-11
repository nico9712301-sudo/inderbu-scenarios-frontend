import { TestingContainer } from '../containers/testing.container';
import { TYPES } from '../types';
import { MockScenarioRepository } from '../mocks/mock-scenario-repository';
import { MockNeighborhoodRepository } from '../mocks/mock-neighborhood-repository';

/**
 * DI Testing Utilities
 * 
 * Provides helper functions and utilities for testing with the DI container.
 * Makes it easy to set up isolated tests with mock dependencies.
 */

// =============================================================================
// CONTAINER SETUP UTILITIES
// =============================================================================

/**
 * Create a clean testing container for each test
 */
export function createTestContainer(): TestingContainer {
  return new TestingContainer();
}

/**
 * Create container with custom test data
 */
export function createTestContainerWithData(options: TestSetupOptions = {}): TestingContainer {
  const container = createTestContainer();
  
  if (options.scenarios || options.neighborhoods) {
    setupTestData(container, options);
  }
  
  return container;
}

// =============================================================================
// TEST DATA SETUP
// =============================================================================

export interface TestSetupOptions {
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
  clearExisting?: boolean;
}

/**
 * Setup test data in container repositories
 */
export function setupTestData(container: TestingContainer, options: TestSetupOptions): void {
  const scenarioRepo = container.getMockScenarioRepository();
  const neighborhoodRepo = container.getMockNeighborhoodRepository();
  
  // Clear existing data if requested
  if (options.clearExisting) {
    scenarioRepo.clear();
    neighborhoodRepo.clear();
  }
  
  // Add test scenarios
  if (options.scenarios) {
    options.scenarios.forEach(scenario => {
      scenarioRepo.addScenario(scenario);
    });
  }
  
  // Add test neighborhoods
  if (options.neighborhoods) {
    options.neighborhoods.forEach(neighborhood => {
      neighborhoodRepo.addNeighborhood(neighborhood);
    });
  }
}

// =============================================================================
// DEPENDENCY TESTING UTILITIES
// =============================================================================

/**
 * Verify that all expected dependencies are bound in the container
 */
export function verifyContainerBindings(container: TestingContainer): TestBindingResult {
  const requiredBindings = [
    TYPES.IScenarioRepository,
    TYPES.INeighborhoodRepository,
    TYPES.CreateScenarioUseCase,
    TYPES.UpdateScenarioUseCase,
    TYPES.GetScenariosUseCase,
    TYPES.GetNeighborhoodsUseCase,
    TYPES.GetScenariosDataUseCase,
  ];

  const results: TestBindingResult = {
    bound: [],
    missing: [],
    total: requiredBindings.length,
    success: true,
  };

  requiredBindings.forEach(binding => {
    if (container.isBound(binding)) {
      results.bound.push(binding.toString());
    } else {
      results.missing.push(binding.toString());
      results.success = false;
    }
  });

  return results;
}

/**
 * Test that a dependency can be resolved without throwing
 */
export function testDependencyResolution<T>(
  container: TestingContainer, 
  identifier: symbol
): TestResolutionResult<T> {
  try {
    const dependency = container.get<T>(identifier);
    return {
      success: true,
      dependency,
      identifier: identifier.toString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      identifier: identifier.toString(),
    };
  }
}

// =============================================================================
// USE CASE TESTING HELPERS
// =============================================================================

/**
 * Get all scenario-related use cases for testing
 */
export function getScenarioUseCases(container: TestingContainer) {
  return {
    createScenario: container.getCreateScenarioUseCase(),
    updateScenario: container.getUpdateScenarioUseCase(),
    getScenarios: container.getGetScenariosUseCase(),
    getNeighborhoods: container.getGetNeighborhoodsUseCase(),
    getScenariosData: container.getGetScenariosDataUseCase(),
  };
}

/**
 * Execute a use case and capture its results and any errors
 */
export async function executeUseCase<TInput, TOutput>(
  useCase: { execute: (input: TInput) => Promise<TOutput> },
  input: TInput
): Promise<UseCaseTestResult<TOutput>> {
  const startTime = Date.now();
  
  try {
    const result = await useCase.execute(input);
    const executionTime = Date.now() - startTime;
    
    return {
      success: true,
      result,
      executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime,
    };
  }
}

// =============================================================================
// MOCK DATA BUILDERS
// =============================================================================

/**
 * Build test scenario data
 */
export class TestScenarioBuilder {
  private data: any = {
    name: 'Test Scenario',
    address: '123 Test Street',
    neighborhoodId: 1,
    active: true,
  };

  withName(name: string): TestScenarioBuilder {
    this.data.name = name;
    return this;
  }

  withAddress(address: string): TestScenarioBuilder {
    this.data.address = address;
    return this;
  }

  withDescription(description: string): TestScenarioBuilder {
    this.data.description = description;
    return this;
  }

  withNeighborhoodId(id: number): TestScenarioBuilder {
    this.data.neighborhoodId = id;
    return this;
  }

  withActive(active: boolean): TestScenarioBuilder {
    this.data.active = active;
    return this;
  }

  build() {
    return { ...this.data };
  }
}

/**
 * Build test neighborhood data
 */
export class TestNeighborhoodBuilder {
  private data: any = {
    name: 'Test Neighborhood',
    communeId: 1,
  };

  withName(name: string): TestNeighborhoodBuilder {
    this.data.name = name;
    return this;
  }

  withCommuneId(id: number): TestNeighborhoodBuilder {
    this.data.communeId = id;
    return this;
  }

  build() {
    return { ...this.data };
  }
}

// =============================================================================
// TEST ASSERTION HELPERS
// =============================================================================

/**
 * Assert that container is healthy
 */
export function assertContainerHealth(container: TestingContainer): void {
  const health = container.getHealthStatus();
  
  if (health.status !== 'healthy') {
    throw new Error(`Container health check failed: ${health.error || 'Unknown error'}`);
  }
}

/**
 * Assert that all repositories contain expected data counts
 */
export function assertRepositoryDataCounts(
  container: TestingContainer,
  expectedCounts: { scenarios?: number; neighborhoods?: number }
): void {
  if (expectedCounts.scenarios !== undefined) {
    const scenarioRepo = container.getMockScenarioRepository();
    const actualCount = scenarioRepo.getCount();
    
    if (actualCount !== expectedCounts.scenarios) {
      throw new Error(`Expected ${expectedCounts.scenarios} scenarios, but found ${actualCount}`);
    }
  }

  if (expectedCounts.neighborhoods !== undefined) {
    const neighborhoodRepo = container.getMockNeighborhoodRepository();
    const actualCount = neighborhoodRepo.getCount();
    
    if (actualCount !== expectedCounts.neighborhoods) {
      throw new Error(`Expected ${expectedCounts.neighborhoods} neighborhoods, but found ${actualCount}`);
    }
  }
}

// =============================================================================
// TYPES
// =============================================================================

export interface TestBindingResult {
  bound: string[];
  missing: string[];
  total: number;
  success: boolean;
}

export interface TestResolutionResult<T> {
  success: boolean;
  dependency?: T;
  error?: string;
  identifier: string;
}

export interface UseCaseTestResult<T> {
  success: boolean;
  result?: T;
  error?: string;
  executionTime: number;
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Create a test scenario builder
 */
export function testScenario(): TestScenarioBuilder {
  return new TestScenarioBuilder();
}

/**
 * Create a test neighborhood builder
 */
export function testNeighborhood(): TestNeighborhoodBuilder {
  return new TestNeighborhoodBuilder();
}

/**
 * Quick setup for common test scenarios
 */
export function quickTestSetup(scenarioCount: number = 3, neighborhoodCount: number = 2): TestingContainer {
  const scenarios = Array.from({ length: scenarioCount }, (_, i) => 
    testScenario()
      .withName(`Test Scenario ${i + 1}`)
      .withAddress(`${100 + i} Test Street`)
      .withNeighborhoodId((i % neighborhoodCount) + 1)
      .build()
  );

  const neighborhoods = Array.from({ length: neighborhoodCount }, (_, i) => 
    testNeighborhood()
      .withName(`Test Neighborhood ${i + 1}`)
      .withCommuneId(1)
      .build()
  );

  return createTestContainerWithData({
    scenarios,
    neighborhoods,
    clearExisting: true,
  });
}
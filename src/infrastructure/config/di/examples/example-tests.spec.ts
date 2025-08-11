/**
 * Example Tests with DI Container
 * 
 * These are example tests demonstrating how to use the DI container for testing.
 * Copy these patterns when writing your own tests.
 */

import { describe, beforeEach, afterEach, it, expect } from '@jest/globals';
import { TestingContainer } from '../containers/testing.container';
import { TYPES } from '../types';
import { 
  createTestContainer,
  createTestContainerWithData,
  setupTestData,
  verifyContainerBindings,
  getScenarioUseCases,
  executeUseCase,
  testScenario,
  testNeighborhood,
  quickTestSetup,
  assertContainerHealth,
  assertRepositoryDataCounts
} from '../testing/test-utilities';

// =============================================================================
// CONTAINER SETUP TESTS
// =============================================================================

describe('DI Container Setup', () => {
  let container: TestingContainer;

  beforeEach(() => {
    container = createTestContainer();
  });

  afterEach(() => {
    // Clean up container after each test
    if (container) {
      container.resetMocks();
    }
  });

  it('should create a healthy testing container', () => {
    // Assert container is properly configured
    assertContainerHealth(container);

    // Verify all required dependencies are bound
    const bindingResult = verifyContainerBindings(container);
    expect(bindingResult.success).toBe(true);
    expect(bindingResult.missing).toHaveLength(0);
  });

  it('should resolve all scenario use cases', () => {
    const useCases = getScenarioUseCases(container);
    
    expect(useCases.createScenario).toBeDefined();
    expect(useCases.updateScenario).toBeDefined();
    expect(useCases.getScenarios).toBeDefined();
    expect(useCases.getNeighborhoods).toBeDefined();
    expect(useCases.getScenariosData).toBeDefined();
  });
});

// =============================================================================
// USE CASE TESTING EXAMPLES
// =============================================================================

describe('Create Scenario Use Case', () => {
  let container: TestingContainer;

  beforeEach(() => {
    container = quickTestSetup(0, 2); // No scenarios, 2 neighborhoods
  });

  afterEach(() => {
    container.resetMocks();
  });

  it('should create a new scenario successfully', async () => {
    const createScenarioUseCase = container.getCreateScenarioUseCase();

    const command = {
      name: 'New Test Scenario',
      address: '456 New Street',
      description: 'A newly created scenario',
      neighborhoodId: 1,
    };

    const result = await executeUseCase(createScenarioUseCase, command);

    expect(result.success).toBe(true);
    expect(result.result).toBeDefined();
    expect(result.result?.name).toBe(command.name);
    expect(result.result?.address).toBe(command.address);
    expect(result.result?.neighborhoodId).toBe(command.neighborhoodId);
    expect(result.executionTime).toBeGreaterThan(0);
  });

  it('should fail validation with empty name', async () => {
    const createScenarioUseCase = container.getCreateScenarioUseCase();

    const command = {
      name: '', // Invalid empty name
      address: '456 New Street',
      neighborhoodId: 1,
    };

    const result = await executeUseCase(createScenarioUseCase, command);

    expect(result.success).toBe(false);
    expect(result.error).toContain('name is required');
  });

  it('should fail validation with invalid neighborhood ID', async () => {
    const createScenarioUseCase = container.getCreateScenarioUseCase();

    const command = {
      name: 'Valid Scenario',
      address: '456 New Street',
      neighborhoodId: -1, // Invalid neighborhood ID
    };

    const result = await executeUseCase(createScenarioUseCase, command);

    expect(result.success).toBe(false);
    expect(result.error).toContain('neighborhood ID is required');
  });
});

// =============================================================================
// UPDATE SCENARIO USE CASE TESTS
// =============================================================================

describe('Update Scenario Use Case', () => {
  let container: TestingContainer;

  beforeEach(() => {
    container = quickTestSetup(3, 2); // 3 scenarios, 2 neighborhoods
  });

  afterEach(() => {
    container.resetMocks();
  });

  it('should update an existing scenario', async () => {
    const updateScenarioUseCase = container.getUpdateScenarioUseCase();

    const command = {
      name: 'Updated Scenario Name',
      description: 'Updated description',
    };

    const result = await executeUseCase(
      { execute: (cmd: typeof command) => updateScenarioUseCase.execute(1, cmd) },
      command
    );

    expect(result.success).toBe(true);
    expect(result.result?.name).toBe(command.name);
    expect(result.result?.description).toBe(command.description);
  });

  it('should fail when updating non-existent scenario', async () => {
    const updateScenarioUseCase = container.getUpdateScenarioUseCase();

    const command = {
      name: 'Updated Name',
    };

    const result = await executeUseCase(
      { execute: (cmd: typeof command) => updateScenarioUseCase.execute(999, cmd) },
      command
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });
});

// =============================================================================
// GET SCENARIOS USE CASE TESTS
// =============================================================================

describe('Get Scenarios Use Case', () => {
  let container: TestingContainer;

  beforeEach(() => {
    // Setup container with specific test data
    container = createTestContainerWithData({
      clearExisting: true,
      scenarios: [
        testScenario()
          .withName('Active Scenario 1')
          .withNeighborhoodId(1)
          .withActive(true)
          .build(),
        testScenario()
          .withName('Active Scenario 2')
          .withNeighborhoodId(2)
          .withActive(true)
          .build(),
        testScenario()
          .withName('Inactive Scenario')
          .withNeighborhoodId(1)
          .withActive(false)
          .build(),
      ],
      neighborhoods: [
        testNeighborhood().withName('Neighborhood 1').build(),
        testNeighborhood().withName('Neighborhood 2').build(),
      ],
    });
  });

  afterEach(() => {
    container.resetMocks();
  });

  it('should get all scenarios with pagination', async () => {
    const getScenariosUseCase = container.getGetScenariosUseCase();

    const query = {
      page: 1,
      limit: 10,
    };

    const result = await executeUseCase(getScenariosUseCase, query);

    expect(result.success).toBe(true);
    expect(result.result?.data).toHaveLength(3);
    expect(result.result?.meta.totalItems).toBe(3);
  });

  it('should filter scenarios by active status', async () => {
    const getScenariosUseCase = container.getGetScenariosUseCase();

    const query = {
      active: true,
      page: 1,
      limit: 10,
    };

    const result = await executeUseCase(getScenariosUseCase, query);

    expect(result.success).toBe(true);
    expect(result.result?.data).toHaveLength(2);
    expect(result.result?.data.every(s => s.active)).toBe(true);
  });

  it('should filter scenarios by neighborhood', async () => {
    const getScenariosUseCase = container.getGetScenariosUseCase();

    const query = {
      neighborhoodId: 1,
      page: 1,
      limit: 10,
    };

    const result = await executeUseCase(getScenariosUseCase, query);

    expect(result.success).toBe(true);
    expect(result.result?.data).toHaveLength(2);
    expect(result.result?.data.every(s => s.neighborhoodId === 1)).toBe(true);
  });

  it('should search scenarios by name', async () => {
    const getScenariosUseCase = container.getGetScenariosUseCase();

    const query = {
      search: 'Active Scenario 1',
      page: 1,
      limit: 10,
    };

    const result = await executeUseCase(getScenariosUseCase, query);

    expect(result.success).toBe(true);
    expect(result.result?.data).toHaveLength(1);
    expect(result.result?.data[0].name).toBe('Active Scenario 1');
  });
});

// =============================================================================
// COMPOSITE USE CASE TESTS
// =============================================================================

describe('Get Scenarios Data Use Case (Composite)', () => {
  let container: TestingContainer;

  beforeEach(() => {
    container = quickTestSetup(5, 3); // 5 scenarios, 3 neighborhoods
  });

  afterEach(() => {
    container.resetMocks();
  });

  it('should get scenarios data with neighborhoods', async () => {
    const getScenariosDataUseCase = container.getGetScenariosDataUseCase();

    const query = {
      scenarioFilters: { page: 1, limit: 10 },
      includeNeighborhoods: true,
      includePagination: true,
    };

    const result = await executeUseCase(getScenariosDataUseCase, query);

    expect(result.success).toBe(true);
    expect(result.result?.scenarios).toBeDefined();
    expect(result.result?.neighborhoods).toBeDefined();
    expect(result.result?.scenarios.data).toHaveLength(5);
    expect(result.result?.neighborhoods).toHaveLength(3);
  });

  it('should get scenarios data without neighborhoods', async () => {
    const getScenariosDataUseCase = container.getGetScenariosDataUseCase();

    const query = {
      scenarioFilters: { page: 1, limit: 3 },
      includeNeighborhoods: false,
      includePagination: true,
    };

    const result = await executeUseCase(getScenariosDataUseCase, query);

    expect(result.success).toBe(true);
    expect(result.result?.scenarios).toBeDefined();
    expect(result.result?.neighborhoods).toBeUndefined();
    expect(result.result?.scenarios.data).toHaveLength(3);
  });
});

// =============================================================================
// MOCK REPOSITORY TESTS
// =============================================================================

describe('Mock Repository Behavior', () => {
  let container: TestingContainer;

  beforeEach(() => {
    container = createTestContainer();
  });

  afterEach(() => {
    container.resetMocks();
  });

  it('should maintain data consistency across use cases', async () => {
    const scenarioRepo = container.getMockScenarioRepository();
    const createUseCase = container.getCreateScenarioUseCase();
    const getScenariosUseCase = container.getGetScenariosUseCase();

    // Initial state
    const initialCount = scenarioRepo.getCount();
    
    // Create a new scenario
    await createUseCase.execute({
      name: 'Consistency Test Scenario',
      address: '123 Consistency St',
      neighborhoodId: 1,
    });

    // Verify count increased
    expect(scenarioRepo.getCount()).toBe(initialCount + 1);

    // Verify scenario appears in queries
    const scenariosResult = await getScenariosUseCase.execute({ page: 1, limit: 10 });
    expect(scenariosResult.meta.totalItems).toBe(initialCount + 1);
    
    const createdScenario = scenariosResult.data.find(s => s.name === 'Consistency Test Scenario');
    expect(createdScenario).toBeDefined();
  });

  it('should isolate test data between test runs', async () => {
    const scenarioRepo = container.getMockScenarioRepository();
    
    // Each test should start with fresh data
    expect(scenarioRepo.getCount()).toBe(3); // Default test data
    
    // Modify data
    await scenarioRepo.create({
      name: 'Temporary Scenario',
      address: '999 Temp St',
      neighborhoodId: 1,
    });
    
    expect(scenarioRepo.getCount()).toBe(4);
    
    // Reset should restore initial state
    scenarioRepo.reset();
    expect(scenarioRepo.getCount()).toBe(3);
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('Integration Tests', () => {
  let container: TestingContainer;

  beforeEach(() => {
    container = quickTestSetup(2, 2);
  });

  afterEach(() => {
    container.resetMocks();
  });

  it('should handle complete scenario lifecycle', async () => {
    const createUseCase = container.getCreateScenarioUseCase();
    const updateUseCase = container.getUpdateScenarioUseCase();
    const getScenariosUseCase = container.getGetScenariosUseCase();

    // 1. Create scenario
    const created = await createUseCase.execute({
      name: 'Lifecycle Test Scenario',
      address: '100 Lifecycle Ave',
      description: 'Initial description',
      neighborhoodId: 1,
    });

    expect(created.name).toBe('Lifecycle Test Scenario');
    expect(created.active).toBe(true);

    // 2. Update scenario
    const updated = await updateUseCase.execute(created.id, {
      name: 'Updated Lifecycle Scenario',
      description: 'Updated description',
      active: false,
    });

    expect(updated.name).toBe('Updated Lifecycle Scenario');
    expect(updated.description).toBe('Updated description');
    expect(updated.active).toBe(false);

    // 3. Verify updated scenario appears in queries
    const allScenarios = await getScenariosUseCase.execute({ page: 1, limit: 10 });
    const foundScenario = allScenarios.data.find(s => s.id === created.id);
    
    expect(foundScenario?.name).toBe('Updated Lifecycle Scenario');
    expect(foundScenario?.active).toBe(false);

    // 4. Verify filtered queries work correctly
    const activeScenarios = await getScenariosUseCase.execute({ 
      active: true, 
      page: 1, 
      limit: 10 
    });
    
    expect(activeScenarios.data.find(s => s.id === created.id)).toBeUndefined();

    const inactiveScenarios = await getScenariosUseCase.execute({ 
      active: false, 
      page: 1, 
      limit: 10 
    });
    
    expect(inactiveScenarios.data.find(s => s.id === created.id)).toBeDefined();
  });

  it('should handle concurrent use case executions', async () => {
    const createUseCase = container.getCreateScenarioUseCase();
    
    // Create multiple scenarios concurrently
    const createPromises = Array.from({ length: 5 }, (_, i) =>
      createUseCase.execute({
        name: `Concurrent Scenario ${i + 1}`,
        address: `${i + 1}00 Concurrent St`,
        neighborhoodId: (i % 2) + 1,
      })
    );

    const results = await Promise.all(createPromises);
    
    expect(results).toHaveLength(5);
    results.forEach((result, i) => {
      expect(result.name).toBe(`Concurrent Scenario ${i + 1}`);
      expect(result.id).toBeDefined();
    });

    // Verify all scenarios were created
    const scenarioRepo = container.getMockScenarioRepository();
    expect(scenarioRepo.getCount()).toBe(7); // 2 initial + 5 created
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

describe('Performance Tests', () => {
  let container: TestingContainer;

  beforeEach(() => {
    container = createTestContainer();
  });

  afterEach(() => {
    container.resetMocks();
  });

  it('should handle large datasets efficiently', async () => {
    const scenarioRepo = container.getMockScenarioRepository();
    const getScenariosUseCase = container.getGetScenariosUseCase();

    // Setup large dataset
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      name: `Performance Test Scenario ${i + 1}`,
      address: `${i + 1} Performance Ave`,
      neighborhoodId: (i % 10) + 1,
      active: i % 2 === 0,
    }));

    // Clear and add large dataset
    scenarioRepo.clear();
    largeDataset.forEach(scenario => scenarioRepo.addScenario(scenario));

    const startTime = Date.now();
    
    // Test pagination performance
    const result = await getScenariosUseCase.execute({
      page: 1,
      limit: 50,
    });
    
    const executionTime = Date.now() - startTime;
    
    expect(result.data).toHaveLength(50);
    expect(result.meta.totalItems).toBe(1000);
    expect(executionTime).toBeLessThan(100); // Should complete in < 100ms
  });

  it('should handle complex filtering efficiently', async () => {
    const scenarioRepo = container.getMockScenarioRepository();
    const getScenariosUseCase = container.getGetScenariosUseCase();

    // Setup test data with known patterns
    scenarioRepo.clear();
    Array.from({ length: 100 }, (_, i) => {
      scenarioRepo.addScenario({
        name: `Test Scenario ${i + 1}`,
        address: `${i + 1} Test Street`,
        neighborhoodId: (i % 5) + 1,
        active: i % 3 === 0, // Every 3rd scenario is active
      });
    });

    const startTime = Date.now();
    
    // Complex filter: active scenarios in neighborhood 1 with "Test" in name
    const result = await getScenariosUseCase.execute({
      search: 'Test',
      neighborhoodId: 1,
      active: true,
      page: 1,
      limit: 10,
    });
    
    const executionTime = Date.now() - startTime;
    
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every(s => s.active && s.neighborhoodId === 1)).toBe(true);
    expect(executionTime).toBeLessThan(50); // Should complete in < 50ms
  });
});

// =============================================================================
// ERROR HANDLING TESTS
// =============================================================================

describe('Error Handling', () => {
  let container: TestingContainer;

  beforeEach(() => {
    container = createTestContainer();
  });

  afterEach(() => {
    container.resetMocks();
  });

  it('should handle repository errors gracefully', async () => {
    const scenarioRepo = container.getMockScenarioRepository();
    const updateUseCase = container.getUpdateScenarioUseCase();

    // Try to update non-existent scenario
    const result = await executeUseCase(
      { execute: (cmd: any) => updateUseCase.execute(99999, cmd) },
      { name: 'Updated Name' }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.executionTime).toBeGreaterThan(0);
  });

  it('should validate business rules consistently', async () => {
    const createUseCase = container.getCreateScenarioUseCase();

    const invalidCommands = [
      { name: '', address: '123 Street', neighborhoodId: 1 },
      { name: 'Valid', address: '', neighborhoodId: 1 },
      { name: 'Valid', address: '123 Street', neighborhoodId: 0 },
      { name: 'Valid', address: '123 Street', neighborhoodId: -1 },
    ];

    for (const command of invalidCommands) {
      const result = await executeUseCase(createUseCase, command);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    }
  });
});

// =============================================================================
// HELPER TEST FUNCTIONS
// =============================================================================

/**
 * Helper function to create test scenarios with specific patterns
 */
function createTestScenariosWithPattern(
  count: number, 
  pattern: { activeRatio?: number; neighborhoodDistribution?: number[] }
): Array<any> {
  return Array.from({ length: count }, (_, i) => {
    const isActive = pattern.activeRatio 
      ? Math.random() < pattern.activeRatio 
      : i % 2 === 0;
    
    const neighborhoodId = pattern.neighborhoodDistribution
      ? pattern.neighborhoodDistribution[i % pattern.neighborhoodDistribution.length]
      : (i % 3) + 1;

    return testScenario()
      .withName(`Pattern Scenario ${i + 1}`)
      .withAddress(`${i + 100} Pattern St`)
      .withNeighborhoodId(neighborhoodId)
      .withActive(isActive)
      .build();
  });
}

/**
 * Helper function to measure use case performance
 */
async function measureUseCasePerformance<T>(
  useCase: { execute: (input: any) => Promise<T> },
  input: any,
  iterations: number = 10
): Promise<{ averageTime: number; minTime: number; maxTime: number; results: T[] }> {
  const results: T[] = [];
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    const result = await useCase.execute(input);
    const endTime = Date.now();
    
    results.push(result);
    times.push(endTime - startTime);
  }

  return {
    averageTime: times.reduce((a, b) => a + b, 0) / times.length,
    minTime: Math.min(...times),
    maxTime: Math.max(...times),
    results,
  };
}
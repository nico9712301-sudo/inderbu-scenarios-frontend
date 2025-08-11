// DDD: Dependency Injection Container for Scenario Detail Feature

import { GetScenarioDetailUseCase, createGetScenarioDetailUseCase } from '@/presentation/features/scenarios/detail/application/GetScenarioDetailUseCase';
import { ScenarioDetailService, createScenarioDetailService } from '@/presentation/features/scenarios/detail/infrastructure/ScenarioDetailService';
import { createInMemoryEventBus } from '@/shared/infrastructure/InMemoryEventBus';

// Import repository adapter
import { createScenarioDetailRepositoryAdapter } from '@/entities/scenario/infrastructure/scneario-detail-repository.adapter';

// NEW: Import CLEAN repository (no legacy dependencies)
import { CleanScenarioRepositoryAdapter } from '@/presentation/features/scenarios/infrastructure/scenarioRepository';

// DDD: Container interface
export interface ScenarioDetailContainer {
  scenarioDetailService: ScenarioDetailService;
  getScenarioDetailUseCase: GetScenarioDetailUseCase;
}

/**
 * Creates and wires all dependencies for the scenario detail feature
 * Following DDD layered architecture with proper dependency injection
 */
export function createScenarioDetailContainer(): ScenarioDetailContainer {
  console.log('Building ScenarioDetail DI Container...');

  // Infrastructure: Event Bus
  const eventBus = createInMemoryEventBus();

  // NEW: Use CLEAN repository adapter (no legacy dependencies)
  const cleanRepository = new CleanScenarioRepositoryAdapter();
  
  // Create bridge wrapper to match expected interface
  const apiServiceBridge = {
    async getById(request: { id: string }) {
      console.log('ApiServiceBridge: Converting findById call for ID:', request.id);
      return await cleanRepository.findById(request.id);
    }
  };

  // Infrastructure: Repository Adapter (Bridge clean API to domain interface)
  const scenarioDetailRepository = createScenarioDetailRepositoryAdapter(apiServiceBridge);

  console.log('Repository adapter created');

  // Application: Use Cases (Business Logic)
  const getScenarioDetailUseCase = createGetScenarioDetailUseCase(
    scenarioDetailRepository,
    eventBus
  );

  console.log('Use cases created');

  // Infrastructure: Service (External API)
  const scenarioDetailService = createScenarioDetailService(getScenarioDetailUseCase);

  console.log('ScenarioDetail DI Container ready');

  return {
    scenarioDetailService,
    getScenarioDetailUseCase
  };
}

// Type-safe dependency access
export type ScenarioDetailDependencies = ReturnType<typeof createScenarioDetailContainer>;

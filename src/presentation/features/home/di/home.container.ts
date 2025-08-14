// DDD: Dependency Injection Container for Home Feature

import { GetHomeDataUseCase, createGetHomeDataUseCase } from '@/presentation/features/home/data/application/get-home-data-use-case';
import { HomeService, createHomeService } from '@/presentation/features/home/data/infrastructure/home-service';

// Import repository adapters
import { createSubScenarioRepositoryAdapter } from '@/entities/sub-scenario/infrastructure/sub-scenario-repository.adapter';

// Import existing API services (temporary bridge)
import { 
  subScenarioApiService, 
  neighborhoodApiService 
} from '@/presentation/features/home/services/home.service';
// import { createActivityAreaRepositoryAdapter } from '@/infrastructure/repositories/activity-area-repository.adapter';
// import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
// import { createServerAuthContext } from '@/shared/api/server-auth';

// DDD: Container interface
export interface HomeContainer {
  homeService: HomeService;
  getHomeDataUseCase: GetHomeDataUseCase;
}

/**
 * Creates and wires all dependencies for the home feature
 * Following DDD layered architecture with proper dependency injection
 */
export function createHomeContainer(): HomeContainer {
  console.log('Building Home DI Container...');

  // Infrastructure: Event Bus
  // const eventBus = createInMemoryEventBus();
  const eventBus = null; // Temporarily disabled

  // Infrastructure: Repository Adapters (Bridge existing APIs to domain interfaces)
  const subScenarioRepository = createSubScenarioRepositoryAdapter(subScenarioApiService);
  // TODO: Update to use DI container instead of individual adapters
  const activityAreaRepository = null; // Temporarily disabled
  const neighborhoodRepository = null; // Temporarily disabled

  // Application: Use Cases (Business Logic)
  // TODO: Refactor to use main DI container
  const getHomeDataUseCase = createGetHomeDataUseCase(
    subScenarioRepository,
    null, // activityAreaRepository - temporarily disabled
    null, // neighborhoodRepository - temporarily disabled
    null  // eventBus - temporarily disabled
  );

  console.log('Use cases created');

  // Infrastructure: Service (External API)
  const homeService = createHomeService(getHomeDataUseCase);

  console.log('Home DI Container ready');

  return {
    homeService,
    getHomeDataUseCase
  };
}

// Type-safe dependency access
export type HomeDependencies = ReturnType<typeof createHomeContainer>;

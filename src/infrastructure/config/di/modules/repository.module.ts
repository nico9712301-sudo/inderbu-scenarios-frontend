import { ContainerModule, interfaces } from 'inversify';
import { TYPES } from '../types';

// Repository Interfaces
import { IScenarioRepository } from '@/domain/scenario/repositories/IScenarioRepository';
import { INeighborhoodRepository } from '@/entities/neighborhood/infrastructure/INeighborhoodRepository';

// Repository Implementations
import { ScenarioRepository } from '@/infrastructure/repositories/scenario-repository.adapter';
import { NeighborhoodRepository } from '@/infrastructure/repositories/neighborhood-repository.adapter';

/**
 * Repository Module
 * 
 * Binds all repository interfaces to their concrete implementations.
 * Repositories are typically singletons for performance (connection pooling, caching).
 */
export const repositoryModule = new ContainerModule((bind: interfaces.Bind) => {
  // ===================================================================
  // SCENARIO REPOSITORY
  // ===================================================================
  bind<IScenarioRepository>(TYPES.IScenarioRepository)
    .to(ScenarioRepository)
    .inSingletonScope()
    .whenTargetIsDefault(); // Only bind as default implementation

  // ===================================================================
  // NEIGHBORHOOD REPOSITORY  
  // ===================================================================
  bind<INeighborhoodRepository>(TYPES.INeighborhoodRepository)
    .to(NeighborhoodRepository)
    .inSingletonScope()
    .whenTargetIsDefault();

  // TODO: Add other repositories as they're created
  // bind<IActivityAreaRepository>(TYPES.IActivityAreaRepository)
  //   .to(ActivityAreaRepository)
  //   .inSingletonScope();
  
  // bind<ISubScenarioRepository>(TYPES.ISubScenarioRepository)
  //   .to(SubScenarioRepository)
  //   .inSingletonScope();
});

/**
 * Mock Repository Module (for testing)
 * 
 * Binds repository interfaces to mock implementations for testing.
 */
export const mockRepositoryModule = new ContainerModule((bind: interfaces.Bind) => {
  // Mock implementations for testing
  // These will be created when we set up the testing infrastructure
  
  // bind<IScenarioRepository>(TYPES.IScenarioRepository)
  //   .toConstantValue(createMockScenarioRepository())
  //   .whenTargetNamed('mock');
  
  // bind<INeighborhoodRepository>(TYPES.INeighborhoodRepository)
  //   .toConstantValue(createMockNeighborhoodRepository())
  //   .whenTargetNamed('mock');
});

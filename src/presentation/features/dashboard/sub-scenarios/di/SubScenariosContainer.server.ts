import { GetSubScenariosDataUseCase } from '../application/GetSubScenariosDataUseCase';
import { SubScenariosService } from '../domain/SubScenariosService';
import {
  SubScenarioRepository,
} from '../infrastructure/SubScenarioRepository';
import {
  ISubScenarioRepository,
} from '../domain/repositories/ISubScenarioRepository';
import { ScenarioRepository } from '../../scenarios/infrastructure/ScenarioRepository';

export interface SubScenariosContainer {
  subScenariosService: SubScenariosService;
}

export function createSubScenariosContainer(): SubScenariosContainer {
  // DDD: Dependency injection - build complete container with repositories
  
  // Infrastructure layer - Repository implementations
  const subScenarioRepository: ISubScenarioRepository = new SubScenarioRepository();
  const scenarioRepository: IScenarioRepository = new ScenarioRepository();
  const activityAreaRepository: IActivityAreaRepository = new ActivityAreaRepository();
  const neighborhoodRepository: INeighborhoodRepository = new NeighborhoodRepository();
  
  // Application layer - Use cases with injected repositories
  const getSubScenariosDataUseCase = new GetSubScenariosDataUseCase(
    subScenarioRepository,
    scenarioRepository,
    activityAreaRepository,
    neighborhoodRepository
  );
  
  // Domain layer - Services with injected use cases
  const subScenariosService = new SubScenariosService(
    getSubScenariosDataUseCase
  );

  return {
    subScenariosService,
  };
}

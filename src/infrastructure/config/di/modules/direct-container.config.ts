import { Container } from 'inversify';
import { TYPES } from '../types';

// Repository Interfaces
import { IScenarioRepository } from '@/domain/scenario/repositories/IScenarioRepository';
import { INeighborhoodRepository } from '@/entities/neighborhood/infrastructure/INeighborhoodRepository';

// Repository Implementations
import { ScenarioRepository } from '@/infrastructure/repositories/scenario-repository.adapter';
import { NeighborhoodRepository } from '@/infrastructure/repositories/neighborhood-repository.adapter';

// Use Case Imports
import { CreateScenarioUseCase } from '@/application/dashboard/scenarios/CreateScenarioUseCase';
import { UpdateScenarioUseCase } from '@/application/dashboard/scenarios/UpdateScenarioUseCase';
import { GetScenariosUseCase } from '@/application/dashboard/scenarios/GetScenariosUseCase';
import { GetNeighborhoodsUseCase } from '@/application/dashboard/scenarios/GetNeighborhoodsUseCase';
import { GetScenariosDataUseCase } from '@/application/dashboard/scenarios/GetScenariosDataUseCase';

/**
 * Alternative Container Configuration Function
 * 
 * This approach manually configures the container instead of using ContainerModule
 * to avoid potential issues with Next.js Hot Module Replacement
 */
export function configureContainer(container: Container): void {
  // ===================================================================
  // REPOSITORIES
  // ===================================================================
  container.bind<IScenarioRepository>(TYPES.IScenarioRepository)
    .to(ScenarioRepository)
    .inSingletonScope();

  container.bind<INeighborhoodRepository>(TYPES.INeighborhoodRepository)
    .to(NeighborhoodRepository)
    .inSingletonScope();

  // ===================================================================
  // USE CASES
  // ===================================================================
  container.bind<CreateScenarioUseCase>(TYPES.CreateScenarioUseCase)
    .to(CreateScenarioUseCase)
    .inTransientScope();

  container.bind<UpdateScenarioUseCase>(TYPES.UpdateScenarioUseCase)
    .to(UpdateScenarioUseCase)
    .inTransientScope();

  container.bind<GetScenariosUseCase>(TYPES.GetScenariosUseCase)
    .to(GetScenariosUseCase)
    .inTransientScope();

  container.bind<GetNeighborhoodsUseCase>(TYPES.GetNeighborhoodsUseCase)
    .to(GetNeighborhoodsUseCase)
    .inTransientScope();

  container.bind<GetScenariosDataUseCase>(TYPES.GetScenariosDataUseCase)
    .to(GetScenariosDataUseCase)
    .inTransientScope();
}

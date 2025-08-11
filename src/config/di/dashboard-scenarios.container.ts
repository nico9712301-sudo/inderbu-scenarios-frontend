import { GetScenariosDataUseCase } from '@/application/dashboard/scenarios/GetScenariosDataUseCase';
import { GetScenariosUseCase } from '@/application/dashboard/scenarios/GetScenariosUseCase';
import { GetNeighborhoodsUseCase } from '@/application/dashboard/scenarios/GetNeighborhoodsUseCase';
import { CreateScenarioUseCase } from '@/application/dashboard/scenarios/CreateScenarioUseCase';
import { UpdateScenarioUseCase } from '@/application/dashboard/scenarios/UpdateScenarioUseCase';

import { IScenarioRepository } from '@/domain/scenario/repositories/IScenarioRepository';
import { INeighborhoodRepository } from '@/domain/neighborhood/repositories/INeighborhoodRepository';

import { ScenarioRepository } from '@/infrastructure/repositories/scenario-repository.adapter';
import { NeighborhoodRepository } from '@/infrastructure/repositories/neighborhood-repository.adapter';

export interface DashboardScenariosContainer {
  // Use Cases
  getScenariosDataUseCase: GetScenariosDataUseCase;
  getScenariosUseCase: GetScenariosUseCase;
  getNeighborhoodsUseCase: GetNeighborhoodsUseCase;
  createScenarioUseCase: CreateScenarioUseCase;
  updateScenarioUseCase: UpdateScenarioUseCase;
}

export function createDashboardScenariosContainer(): DashboardScenariosContainer {
  // Infrastructure Layer: Repository implementations
  const scenarioRepository: IScenarioRepository = new ScenarioRepository();
  const neighborhoodRepository: INeighborhoodRepository = new NeighborhoodRepository();

  // Application Layer: Use Cases with injected services
  const getScenariosUseCase = new GetScenariosUseCase(scenarioRepository);
  const getNeighborhoodsUseCase = new GetNeighborhoodsUseCase(neighborhoodRepository);
  
  const getScenariosDataUseCase = new GetScenariosDataUseCase(
    getScenariosUseCase,
    getNeighborhoodsUseCase
  );
  
  const createScenarioUseCase: CreateScenarioUseCase = new CreateScenarioUseCase(scenarioRepository);
  const updateScenarioUseCase: UpdateScenarioUseCase = new UpdateScenarioUseCase(scenarioRepository);

  return {
    // Use Cases
    getScenariosDataUseCase,
    getScenariosUseCase,
    getNeighborhoodsUseCase,
    createScenarioUseCase,
    updateScenarioUseCase,
  };
}

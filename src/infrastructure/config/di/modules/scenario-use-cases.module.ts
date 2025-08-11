import { ContainerModule, interfaces } from 'inversify';
import { TYPES } from '../types';

// Use Case Imports
import { CreateScenarioUseCase } from '@/application/dashboard/scenarios/CreateScenarioUseCase';
import { UpdateScenarioUseCase } from '@/application/dashboard/scenarios/UpdateScenarioUseCase';
import { GetScenariosUseCase } from '@/application/dashboard/scenarios/GetScenariosUseCase';

/**
 * Scenario Use Cases Module
 * 
 * Binds all scenario-related use cases.
 * Use cases are transient by default - new instance per request for better isolation.
 */
export const scenarioUseCasesModule = new ContainerModule((bind: interfaces.Bind) => {
      // ===================================================================
      // SCENARIO CRUD USE CASES
      // ===================================================================
      
      // Create Scenario Use Case
      bind<CreateScenarioUseCase>(TYPES.CreateScenarioUseCase)
        .to(CreateScenarioUseCase)
        .inTransientScope() // New instance per request
        .whenTargetIsDefault();

      // Update Scenario Use Case
      bind<UpdateScenarioUseCase>(TYPES.UpdateScenarioUseCase)
        .to(UpdateScenarioUseCase)
        .inTransientScope()
        .whenTargetIsDefault();

      // Get Scenarios Use Case
      bind<GetScenariosUseCase>(TYPES.GetScenariosUseCase)
        .to(GetScenariosUseCase)
        .inTransientScope()
        .whenTargetIsDefault();

      // TODO: Add these use cases when they're created
      // bind<GetScenarioByIdUseCase>(TYPES.GetScenarioByIdUseCase)
      //   .to(GetScenarioByIdUseCase)
      //   .inTransientScope();

      // bind<DeleteScenarioUseCase>(TYPES.DeleteScenarioUseCase)
      //   .to(DeleteScenarioUseCase)
      //   .inTransientScope();
});

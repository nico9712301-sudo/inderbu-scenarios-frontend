import { ContainerModule, interfaces } from 'inversify';
import { TYPES } from '../types';

// Composite Use Case Imports
import { GetScenariosDataUseCase } from '@/application/dashboard/scenarios/GetScenariosDataUseCase';

/**
 * Composite Use Cases Module
 * 
 * Binds use cases that coordinate multiple domain operations.
 * These are typically more complex use cases that orchestrate multiple repositories or services.
 */
export const compositeUseCasesModule = new ContainerModule((bind: interfaces.Bind) => {
      // ===================================================================
      // COMPOSITE/ORCHESTRATION USE CASES
      // ===================================================================
      
      // Get Scenarios Data Use Case (combines scenarios + neighborhoods)
      bind<GetScenariosDataUseCase>(TYPES.GetScenariosDataUseCase)
        .to(GetScenariosDataUseCase)
        .inTransientScope() // Transient because it coordinates multiple dependencies
        .whenTargetIsDefault();

      // TODO: Add other composite use cases as needed
      // Examples:
      // - GetDashboardDataUseCase (combines multiple domain data)
      // - ImportScenariosUseCase (coordinates file parsing + validation + saving)
      // - GenerateReportUseCase (coordinates data gathering + formatting + export)
});

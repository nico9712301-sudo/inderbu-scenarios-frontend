import { ContainerModule, interfaces } from 'inversify';
import { TYPES } from '../types';

// Neighborhood Use Case Imports
import { GetNeighborhoodsUseCase } from '@/application/dashboard/scenarios/GetNeighborhoodsUseCase';

/**
 * Neighborhood Use Cases Module
 * 
 * Binds all neighborhood-related use cases.
 * Use cases are transient by default for better isolation and testing.
 */
export const neighborhoodUseCasesModule = new ContainerModule((bind: interfaces.Bind) => {
      // ===================================================================
      // NEIGHBORHOOD USE CASES
      // ===================================================================
      
      // Get Neighborhoods Use Case
      bind<GetNeighborhoodsUseCase>(TYPES.GetNeighborhoodsUseCase)
        .to(GetNeighborhoodsUseCase)
        .inTransientScope()
        .whenTargetIsDefault();

      // TODO: Add these use cases when they're created
      // bind<CreateNeighborhoodUseCase>(TYPES.CreateNeighborhoodUseCase)
      //   .to(CreateNeighborhoodUseCase)
      //   .inTransientScope();

      // bind<UpdateNeighborhoodUseCase>(TYPES.UpdateNeighborhoodUseCase)
      //   .to(UpdateNeighborhoodUseCase)
      //   .inTransientScope();
});

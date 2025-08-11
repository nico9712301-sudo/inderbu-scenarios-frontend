import { BaseContainer } from './base.container';
import { TYPES } from '../types';

// Modules
import { repositoryModule } from '../modules/repository.module';
import { scenarioUseCasesModule } from '../modules/scenario-use-cases.module';
import { neighborhoodUseCasesModule } from '../modules/neighborhood-use-cases.module';
import { compositeUseCasesModule } from '../modules/composite-use-cases.module';

// Use Case Types for convenience methods
import { CreateScenarioUseCase } from '@/application/dashboard/scenarios/CreateScenarioUseCase';
import { UpdateScenarioUseCase } from '@/application/dashboard/scenarios/UpdateScenarioUseCase';
import { GetScenariosUseCase } from '@/application/dashboard/scenarios/GetScenariosUseCase';
import { GetNeighborhoodsUseCase } from '@/application/dashboard/scenarios/GetNeighborhoodsUseCase';
import { GetScenariosDataUseCase } from '@/application/dashboard/scenarios/GetScenariosDataUseCase';

/**
 * Main Scenario Container
 * 
 * Orchestrates all scenario-related dependencies including:
 * - Repositories (data access)
 * - Use Cases (business logic) 
 * - Composite operations (cross-domain coordination)
 * 
 * This container provides the complete dependency graph for scenario operations.
 */
export class ScenarioContainer extends BaseContainer {
  
  /**
   * Configure the container with all necessary modules
   */
  protected configureContainer(): void {
    // Load all required modules
    this.container.load(
      repositoryModule,                 // Data access layer
      scenarioUseCasesModule,           // Scenario business logic
      neighborhoodUseCasesModule,       // Neighborhood operations
      compositeUseCasesModule           // Cross-domain coordination
    );
  }

  /**
   * Hook called after container configuration
   * Useful for validation, logging, or additional setup
   */
  protected onContainerConfigured(): void {
    // Optional: Validate that all critical dependencies are bound
    this.validateCriticalDependencies();
  }

  // =========================================================================
  // CONVENIENCE METHODS FOR COMMON USE CASES
  // =========================================================================
  // These methods provide type-safe, convenient access to frequently used dependencies

  /**
   * Get Create Scenario Use Case
   */
  getCreateScenarioUseCase(): CreateScenarioUseCase {
    return this.get<CreateScenarioUseCase>(TYPES.CreateScenarioUseCase);
  }

  /**
   * Get Update Scenario Use Case
   */
  getUpdateScenarioUseCase(): UpdateScenarioUseCase {
    return this.get<UpdateScenarioUseCase>(TYPES.UpdateScenarioUseCase);
  }

  /**
   * Get Scenarios Use Case
   */
  getGetScenariosUseCase(): GetScenariosUseCase {
    return this.get<GetScenariosUseCase>(TYPES.GetScenariosUseCase);
  }

  /**
   * Get Neighborhoods Use Case
   */
  getGetNeighborhoodsUseCase(): GetNeighborhoodsUseCase {
    return this.get<GetNeighborhoodsUseCase>(TYPES.GetNeighborhoodsUseCase);
  }

  /**
   * Get Scenarios Data Use Case (composite operation)
   */
  getGetScenariosDataUseCase(): GetScenariosDataUseCase {
    return this.get<GetScenariosDataUseCase>(TYPES.GetScenariosDataUseCase);
  }

  // =========================================================================
  // CONTAINER HEALTH & VALIDATION
  // =========================================================================

  /**
   * Validate that all critical dependencies are properly bound
   * Throws an error if any critical dependency is missing
   */
  private validateCriticalDependencies(): void {
    const criticalDependencies = [
      TYPES.IScenarioRepository,
      TYPES.INeighborhoodRepository,
      TYPES.CreateScenarioUseCase,
      TYPES.UpdateScenarioUseCase,
      TYPES.GetScenariosUseCase,
      TYPES.GetNeighborhoodsUseCase,
      TYPES.GetScenariosDataUseCase,
    ];

    const missingDependencies: symbol[] = [];

    for (const dependency of criticalDependencies) {
      if (!this.isBound(dependency)) {
        missingDependencies.push(dependency);
      }
    }

    if (missingDependencies.length > 0) {
      const missingNames = missingDependencies.map(dep => dep.toString()).join(', ');
      throw new Error(
        `ScenarioContainer validation failed. Missing critical dependencies: ${missingNames}`
      );
    }
  }

  /**
   * Get container health status for monitoring/debugging
   */
  getHealthStatus(): ContainerHealthStatus {
    try {
      this.validateCriticalDependencies();
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        boundDependencies: this.getBoundDependencyCount(),
        criticalDependenciesOk: true,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        boundDependencies: this.getBoundDependencyCount(),
        criticalDependenciesOk: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get count of bound dependencies (useful for monitoring)
   */
  private getBoundDependencyCount(): number {
    // Use the public API to get all bindings and count them
    // InversifyJS Container has a 'getAllBindings' method in recent versions
    // If not available, fallback to Object.keys(this.container._bindingDictionary._map).length (not recommended)
    if (typeof (this.container as any).getAllBindings === 'function') {
      return ((this.container as any).getAllBindings() as any[]).length;
    }
    // Fallback for older Inversify versions (not recommended, but works)
    const bindingDictionary = (this.container as any)._bindingDictionary;
    if (bindingDictionary && typeof bindingDictionary.traverse === 'function') {
      let count = 0;
      bindingDictionary.traverse(() => count++);
      return count;
    }
    return 0;
  }
}

/**
 * Container health status interface
 */
export interface ContainerHealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  boundDependencies: number;
  criticalDependenciesOk: boolean;
  error?: string;
}

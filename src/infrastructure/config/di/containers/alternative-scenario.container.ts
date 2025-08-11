import { BaseContainer } from './base.container';
import { TYPES } from '../types';
import { configureContainer } from '../modules/direct-container.config';

// Use Case Types for convenience methods
import { CreateScenarioUseCase } from '@/application/dashboard/scenarios/CreateScenarioUseCase';
import { UpdateScenarioUseCase } from '@/application/dashboard/scenarios/UpdateScenarioUseCase';
import { GetScenariosUseCase } from '@/application/dashboard/scenarios/GetScenariosUseCase';
import { GetNeighborhoodsUseCase } from '@/application/dashboard/scenarios/GetNeighborhoodsUseCase';
import { GetScenariosDataUseCase } from '@/application/dashboard/scenarios/GetScenariosDataUseCase';

/**
 * Alternative Scenario Container
 * 
 * Uses direct container configuration instead of ContainerModule
 * to avoid potential compatibility issues with Next.js
 */
export class AlternativeScenarioContainer extends BaseContainer {
  
  /**
   * Configure the container with direct bindings
   */
  protected configureContainer(): void {
    try {
      // Use direct configuration instead of modules
      configureContainer(this.container);
      console.log('✅ Container configured successfully with direct approach');
    } catch (error) {
      console.error('Error configuring container:', error);
      throw error;
    }
  }

  /**
   * Hook called after container configuration
   */
  protected onContainerConfigured(): void {
    // Optional: Validate that all critical dependencies are bound
    this.validateCriticalDependencies();
    console.log('✅ Container validation passed');
  }

  // =========================================================================
  // CONVENIENCE METHODS FOR COMMON USE CASES
  // =========================================================================

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
        `AlternativeScenarioContainer validation failed. Missing critical dependencies: ${missingNames}`
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
    const bindings = this.container.getAll(Symbol.for(''));
    return bindings.length;
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

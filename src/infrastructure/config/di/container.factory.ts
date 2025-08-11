import { IContainer } from './containers/base.container';
import { ScenarioContainer } from './containers/scenario.container';
import { DevelopmentContainer } from './containers/development.container';
import { TestingContainer } from './containers/testing.container';
import { ProductionContainer } from './containers/production.container';
import { Environment } from './types';

/**
 * Container Factory
 * 
 * Environment-aware factory for creating appropriate DI containers.
 * Implements singleton pattern to ensure one container instance per environment.
 */
export class ContainerFactory {
  private static instance: IContainer | null = null;
  private static currentEnvironment: string | null = null;

  /**
   * Create or get the singleton container instance based on environment
   */
  static createContainer(): IContainer {
    const environment: Environment = ContainerFactory.detectEnvironment();

    // Return existing instance if environment hasn't changed
    if (
      ContainerFactory.instance &&
      ContainerFactory.currentEnvironment === environment
    ) {
      return ContainerFactory.instance;
    }

    // Create new container for the detected environment
    ContainerFactory.instance = ContainerFactory.createEnvironmentContainer(environment);
    ContainerFactory.currentEnvironment = environment;

    return ContainerFactory.instance;
  }

  /**
   * Create container for specific environment (useful for testing)
   */
  static createContainerForEnvironment(environment: Environment): IContainer {
    return ContainerFactory.createEnvironmentContainer(environment);
  }

  /**
   * Reset the singleton instance (useful for testing or environment changes)
   */
  static resetContainer(): void {
    ContainerFactory.instance = null;
    ContainerFactory.currentEnvironment = null;
  }

  /**
   * Get current container instance without creating a new one
   */
  static getCurrentContainer(): IContainer | null {
    return ContainerFactory.instance;
  }

  /**
   * Detect the current environment from various sources
   */
  private static detectEnvironment(): Environment {
    // Priority order for environment detection:
    // 1. Explicit CONTAINER_ENV override
    // 2. NODE_ENV
    // 3. NEXT_PUBLIC_ENV
    // 4. Default to development

    const explicitEnv = process.env.CONTAINER_ENV;
    if (explicitEnv && ContainerFactory.isValidEnvironment(explicitEnv)) {
      return explicitEnv as Environment;
    }

    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv && ContainerFactory.isValidEnvironment(nodeEnv)) {
      return nodeEnv as Environment;
    }

    const nextEnv = process.env.NEXT_PUBLIC_ENV;
    if (nextEnv && ContainerFactory.isValidEnvironment(nextEnv)) {
      return nextEnv as Environment;
    }

    // Default to development for safety
    return Environment.DEVELOPMENT;
  }

  /**
   * Validate if a string is a valid environment value
   */
  private static isValidEnvironment(env: string): boolean {
    return Object.values(Environment).includes(env as Environment);
  }

  /**
   * Create the appropriate container based on environment
   */
  private static createEnvironmentContainer(environment: Environment): IContainer {
    console.log(`  Creating ${environment} container...`);

    switch (environment) {
      case Environment.PRODUCTION:
        return new ProductionContainer();

      case Environment.TEST:
        return new TestingContainer();

      case Environment.DEVELOPMENT:
      default:
        return new DevelopmentContainer();
    }
  }

  // =========================================================================
  // CONVENIENCE METHODS FOR COMMON OPERATIONS
  // =========================================================================

  /**
   * Get a dependency from the current container
   */
  static getDependency<T>(identifier: symbol): T {
    const container = ContainerFactory.createContainer();
    return container.get<T>(identifier as any);
  }

  /**
   * Check if a dependency is available in the current container
   */
  static hasDependency(identifier: symbol): boolean {
    const container = ContainerFactory.createContainer();
    return container.isBound(identifier as any);
  }

  /**
   * Get container information for debugging/monitoring
   */
  static getContainerInfo(): ContainerInfo {
    const environment = ContainerFactory.detectEnvironment();
    const hasInstance = ContainerFactory.instance !== null;
    
    let health: any = null;
    if (hasInstance && 'getHealthStatus' in ContainerFactory.instance!) {
      health = (ContainerFactory.instance as any).getHealthStatus();
    }

    return {
      environment,
      hasInstance,
      currentEnvironment: ContainerFactory.currentEnvironment,
      containerType: ContainerFactory.getContainerType(),
      health,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get the type of the current container
   */
  private static getContainerType(): string {
    if (!ContainerFactory.instance) {
      return 'none';
    }

    if (ContainerFactory.instance instanceof ProductionContainer) {
      return 'production';
    }
    if (ContainerFactory.instance instanceof TestingContainer) {
      return 'testing';
    }
    if (ContainerFactory.instance instanceof DevelopmentContainer) {
      return 'development';
    }
    if (ContainerFactory.instance instanceof ScenarioContainer) {
      return 'base';
    }

    return 'unknown';
  }
}

/**
 * Container information interface for monitoring/debugging
 */
export interface ContainerInfo {
  environment: Environment;
  hasInstance: boolean;
  currentEnvironment: string | null;
  containerType: string;
  health: any;
  timestamp: string;
}

// ============================================================================= 
// GLOBAL CONTAINER ACCESS (USE SPARINGLY)
// =============================================================================

/**
 * Global function to get the current container
 * 
 *   WARNING: Use this sparingly and prefer dependency injection.
 * This is mainly for framework integration points where DI isn't available.
 */
export function getGlobalContainer(): IContainer {
  return ContainerFactory.createContainer();
}

/**
 * Global function to get a dependency
 * 
 *   WARNING: Use this sparingly and prefer dependency injection.
 * This is mainly for framework integration points where DI isn't available.
 */
export function getGlobalDependency<T>(identifier: symbol): T {
  return ContainerFactory.getDependency<T>(identifier);
}

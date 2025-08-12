import { SimpleContainer, IContainer } from './simple-container';
import { TOKENS, Environment } from './tokens';

// Repository imports
import { ScenarioRepository } from '@/infrastructure/repositories/scenario-repository.adapter';
import { NeighborhoodRepository } from '@/infrastructure/repositories/neighborhood-repository.adapter';
import { ActivityAreaRepositoryAdapter } from '@/infrastructure/repositories/activity-area-repository.adapter';
import { activityAreaApiService } from '@/presentation/features/home/services/home.service';
import { SubScenarioRepository } from '@/presentation/features/dashboard/sub-scenarios/infrastructure/SubScenarioRepository';
import type { INeighborhoodRepository } from '@/entities/neighborhood/domain/INeighborhoodRepository';
import type { IActivityAreaRepository } from '@/entities/activity-area/domain/IActivityAreaRepository';
import type { ISubScenarioRepository } from '@/presentation/features/dashboard/sub-scenarios/domain/repositories/ISubScenarioRepository';

// Use Case imports
import { CreateScenarioUseCase } from '@/application/dashboard/scenarios/use-cases/CreateScenarioUseCase';
import { UpdateScenarioUseCase } from '@/application/dashboard/scenarios/use-cases/UpdateScenarioUseCase';
import { GetScenariosDataUseCase } from '@/application/dashboard/scenarios/use-cases/GetScenariosDataUseCase';
import { GetScenariosUseCase } from '@/application/dashboard/scenarios/use-cases/GetScenariosUseCase';
import { GetNeighborhoodsUseCase } from '@/application/dashboard/scenarios/use-cases/GetNeighborhoodsUseCase';
import { GetSubScenariosDataUseCase } from '@/presentation/features/dashboard/sub-scenarios/application/GetSubScenariosDataUseCase';
import { CreateSubScenarioUseCase } from '@/application/dashboard/sub-scenarios/use-cases/CreateSubScenarioUseCase';
import { UpdateSubScenarioUseCase } from '@/application/dashboard/sub-scenarios/use-cases/UpdateSubScenarioUseCase';
import { UploadSubScenarioImagesUseCase } from '@/application/dashboard/sub-scenarios/use-cases/UploadSubScenarioImagesUseCase';

// HTTP Client imports  
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';
import { IScenarioRepository } from '@/entities/scenario/infrastructure/IScenarioRepository';

/**
 * Container Factory
 * 
 * Environment-aware factory for creating Simple DI containers.
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
    console.log(` Creating ${environment} container...`);

    const container = new SimpleContainer();
    
    // Configure base dependencies
    ContainerFactory.configureRepositories(container);
    ContainerFactory.configureUseCases(container);
    
    // Environment-specific overrides
    switch (environment) {
      case Environment.PRODUCTION:
        ContainerFactory.configureProduction(container);
        break;
      case Environment.TEST:
        ContainerFactory.configureTesting(container);
        break;
      case Environment.DEVELOPMENT:
      default:
        ContainerFactory.configureDevelopment(container);
        break;
    }

    console.log('Container created successfully');
    return container;
  }

  /**
   * Configure repository dependencies (singletons for performance)
   */
  private static configureRepositories(container: SimpleContainer): void {
    // Create shared HTTP client
    const createHttpClient = () => {
      const authContext = createServerAuthContext();
      return ClientHttpClientFactory.createClient(authContext);
    };

    // Scenario Repository (singleton)
    container.bind<IScenarioRepository>(TOKENS.IScenarioRepository)
      .to(() => new ScenarioRepository(createHttpClient()))
      .singleton();

    // Neighborhood Repository (singleton)
    container.bind<INeighborhoodRepository>(TOKENS.INeighborhoodRepository)
      .to(() => new NeighborhoodRepository(createHttpClient()))
      .singleton();

    // Activity Area Repository (singleton)
    container.bind<IActivityAreaRepository>(TOKENS.IActivityAreaRepository)
      .to(() => new ActivityAreaRepositoryAdapter(activityAreaApiService))
      .singleton();

    // Sub Scenario Repository (singleton)
    container.bind<ISubScenarioRepository>(TOKENS.ISubScenarioRepository)
      .to(() => new SubScenarioRepository())
      .singleton();
  }

  /**
   * Configure use case dependencies (transient for isolation)
   */
  private static configureUseCases(container: SimpleContainer): void {
    // Create Scenario Use Case
    container.bind<CreateScenarioUseCase>(TOKENS.CreateScenarioUseCase)
      .to(() => new CreateScenarioUseCase(
        container.get<IScenarioRepository>(TOKENS.IScenarioRepository)
      ));

    // Update Scenario Use Case
    container.bind<UpdateScenarioUseCase>(TOKENS.UpdateScenarioUseCase)
      .to(() => new UpdateScenarioUseCase(
        container.get<IScenarioRepository>(TOKENS.IScenarioRepository)
      ));

    // Get Scenarios Use Case
    container.bind<GetScenariosUseCase>(TOKENS.GetScenariosUseCase)
      .to(() => new GetScenariosUseCase(
        container.get<IScenarioRepository>(TOKENS.IScenarioRepository)
      ));

    // Get Neighborhoods Use Case
    container.bind<GetNeighborhoodsUseCase>(TOKENS.GetNeighborhoodsUseCase)
      .to(() => new GetNeighborhoodsUseCase(
        container.get<INeighborhoodRepository>(TOKENS.INeighborhoodRepository)
      ));

    // Get Scenarios Data Use Case (composite)
    container.bind<GetScenariosDataUseCase>(TOKENS.GetScenariosDataUseCase)
      .to(() => new GetScenariosDataUseCase(
        container.get<GetScenariosUseCase>(TOKENS.GetScenariosUseCase),
        container.get<GetNeighborhoodsUseCase>(TOKENS.GetNeighborhoodsUseCase)
      ));

    // Get Sub-Scenarios Data Use Case (composite)
    container.bind<GetSubScenariosDataUseCase>(TOKENS.GetSubScenariosDataUseCase)
      .to(() => new GetSubScenariosDataUseCase(
        container.get<ISubScenarioRepository>(TOKENS.ISubScenarioRepository),
        container.get<IScenarioRepository>(TOKENS.IScenarioRepository),
        container.get<IActivityAreaRepository>(TOKENS.IActivityAreaRepository),
        container.get<INeighborhoodRepository>(TOKENS.INeighborhoodRepository)
      ));

    // Create Sub-Scenario Use Case
    container.bind<CreateSubScenarioUseCase>(TOKENS.CreateSubScenarioUseCase)
      .to(() => new CreateSubScenarioUseCase(
        container.get<ISubScenarioRepository>(TOKENS.ISubScenarioRepository)
      ));

    // Update Sub-Scenario Use Case
    container.bind<UpdateSubScenarioUseCase>(TOKENS.UpdateSubScenarioUseCase)
      .to(() => new UpdateSubScenarioUseCase(
        container.get<ISubScenarioRepository>(TOKENS.ISubScenarioRepository)
      ));

    // Upload Sub-Scenario Images Use Case
    container.bind<UploadSubScenarioImagesUseCase>(TOKENS.UploadSubScenarioImagesUseCase)
      .to(() => new UploadSubScenarioImagesUseCase());
  }

  /**
   * Configure development-specific dependencies
   */
  private static configureDevelopment(container: SimpleContainer): void {
    // Development-specific logging, monitoring, etc.
    console.log('🔧 Development environment configured');
  }

  /**
   * Configure production-specific dependencies
   */
  private static configureProduction(container: SimpleContainer): void {
    // Production optimizations
    console.log('🚀 Production environment configured');
  }

  /**
   * Configure testing-specific dependencies (mocks)
   */
  private static configureTesting(container: SimpleContainer): void {
    // Override with mocks for testing
    console.log('🧪 Testing environment configured with mocks');
  }
}

/**
 * Convenience function to get the current container
 */
export function getContainer(): IContainer {
  return ContainerFactory.createContainer();
}

/**
 * Convenience function to get a dependency
 */
export function getDependency<T>(token: string): T {
  return getContainer().get<T>(token);
}
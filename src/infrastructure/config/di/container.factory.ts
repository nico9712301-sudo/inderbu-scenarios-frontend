import { SimpleContainer, IContainer } from './simple-container';
import { TOKENS, Environment } from './tokens';

// Repository imports
import { FieldSurfaceTypeRepositoryAdapter } from '@/infrastructure/repositories/field-surface-type/field-surface-type-repository.adapter';
import { ActivityAreaRepositoryAdapter } from '@/infrastructure/repositories/activity-area/activity-area-repository.adapter';
import { NeighborhoodRepositoryAdapter } from '@/infrastructure/repositories/neighborhood/neighborhood-repository.adapter';
import { SubScenarioRepository } from '@/infrastructure/repositories/sub-scenario/sub-scenario-repository.adapter';
import { ReservationRepository } from '@/infrastructure/repositories/reservation/reservation-repository.adapter';
import { ScenarioRepository } from '@/infrastructure/repositories/scenario/scenario-repository.adapter';
import { UserRepositoryAdapter } from '@/infrastructure/repositories/user/user-repository.adapter';
import { RoleRepositoryAdapter } from '@/infrastructure/repositories/role/role-repository.adapter';
import { CommuneRepository } from '@/infrastructure/repositories/commune/commune-repository.adapter';
import { CityRepository } from '@/infrastructure/repositories/city/city-repository.adapter';
import { ReceiptRepository, createReceiptRepository } from '@/infrastructure/repositories/billing/receipt-repository.adapter';
import { TemplateRepository, createTemplateRepository } from '@/infrastructure/repositories/billing/template-repository.adapter';
import { PaymentProofRepository, createPaymentProofRepository } from '@/infrastructure/repositories/billing/payment-proof-repository.adapter';
import { SubScenarioPriceRepository, createSubScenarioPriceRepository } from '@/infrastructure/repositories/billing/sub-scenario-price-repository.adapter';

// Domain imports
import type { IFieldSurfaceTypeRepository } from '@/entities/field-surface-type/domain/IFieldSurfaceTypeRepository';
import type { IReservationRepository } from '@/entities/reservation/infrastructure/IReservationRepository';
import type { ISubScenarioRepository } from '@/entities/sub-scenario/infrastructure/ISubScenarioRepository';
import { INeighborhoodRepository } from '@/entities/neighborhood/infrastructure/INeighborhoodRepository';
import { IScenarioRepository } from '@/entities/scenario/infrastructure/scenario-repository.port';
import type { IRoleRepository } from '@/entities/role/infrastructure/IRoleRepository';
import type { IUserRepository } from '@/entities/user/infrastructure/IUserRepository';
import type { ICommuneRepository } from '@/entities/commune/infrastructure/commune-repository.port';
import type { ICityRepository } from '@/entities/city/infrastructure/city-repository.port';
import type { IReceiptRepository } from '@/entities/billing/infrastructure/IReceiptRepository';
import type { ITemplateRepository } from '@/entities/billing/infrastructure/ITemplateRepository';
import type { IPaymentProofRepository } from '@/entities/billing/infrastructure/IPaymentProofRepository';
import type { ISubScenarioPriceRepository } from '@/entities/billing/infrastructure/ISubScenarioPriceRepository';

// Use Case imports
import { GetUserReservationsUseCase as AppGetUserReservationsUseCase } from '@/application/reservations/use-cases/GetUserReservationsUseCase';
import { UploadSubScenarioImagesUseCase } from '@/application/dashboard/sub-scenarios/use-cases/UploadSubScenarioImagesUseCase';
import { GetFieldSurfaceTypesUseCase } from '@/application/dashboard/field-surface-types/use-cases/GetFieldSurfaceTypesUseCase';
import { GetScenarioDetailUseCase, GetScenarioDetailUseCaseImpl } from '@/application/scenario-detail/GetScenarioDetailUseCase';
import { GetAvailabilityUseCase, GetAvailabilityUseCaseImpl } from '@/application/availability/use-cases/GetAvailabilityUseCase';
import { GetSubScenariosDataService } from '@/application/dashboard/sub-scenarios/services/GetSubScenariosDataService';
import { CreateSubScenarioUseCase } from '@/application/dashboard/sub-scenarios/use-cases/CreateSubScenarioUseCase';
import { UpdateSubScenarioUseCase } from '@/application/dashboard/sub-scenarios/use-cases/UpdateSubScenarioUseCase';
import { GetUserReservationsDataService } from '@/application/reservations/services/GetUserReservationsDataService';
import { GetActivityAreasUseCase } from '@/application/dashboard/activity-areas/use-cases/GetActivityAreasUseCase';
import { GetSubScenariosUseCase } from '@/application/dashboard/sub-scenarios/use-cases/GetSubScenariosUseCase';
import { GetNeighborhoodsUseCase } from '@/application/dashboard/scenarios/use-cases/GetNeighborhoodsUseCase';
import { GetScenariosDataService } from '@/application/dashboard/scenarios/services/GetScenariosDataService';
import { CreateScenarioUseCase } from '@/application/dashboard/scenarios/use-cases/CreateScenarioUseCase';
import { UpdateScenarioUseCase } from '@/application/dashboard/scenarios/use-cases/UpdateScenarioUseCase';
import { GetClientsDataService } from '@/application/dashboard/clients/services/GetClientsDataService';
import { GetScenariosUseCase } from '@/application/dashboard/scenarios/use-cases/GetScenariosUseCase';
import { GetUserByIdUseCase } from '@/application/dashboard/clients/use-cases/GetUserByIdUseCase';
import { GetUsersUseCase } from '@/application/dashboard/clients/use-cases/GetUsersUseCase';
import { CreateUserUseCase } from '@/application/dashboard/clients/use-cases/CreateUserUseCase';
import { UpdateUserUseCase } from '@/application/dashboard/clients/use-cases/UpdateUserUseCase';
import { GetRolesUseCase } from '@/application/dashboard/clients/use-cases/GetRolesUseCase';
import { GetHomeDataUseCase } from '@/application/home/use-cases/GetHomeDataUseCase';
import { GetHomeDataService } from '@/application/home/services/GetHomeDataService';
import { GetAdminUsersDataService } from '@/application/dashboard/admin-users/services/GetAdminUsersDataService';
import { GetCommunesUseCase } from '@/application/dashboard/locations/use-cases/GetCommunesUseCase';
import { GetCitiesUseCase } from '@/application/dashboard/locations/use-cases/GetCitiesUseCase';
import { GetLocationsDataUseCase } from '@/application/dashboard/locations/use-cases/GetLocationsDataUseCase';
import { GetLocationsDataService } from '@/application/dashboard/locations/services/GetLocationsDataService';
import { GenerateReceiptUseCase } from '@/application/dashboard/billing/use-cases/GenerateReceiptUseCase';
import { SendReceiptByEmailUseCase } from '@/application/dashboard/billing/use-cases/SendReceiptByEmailUseCase';
import { GetReceiptsByReservationUseCase } from '@/application/dashboard/billing/use-cases/GetReceiptsByReservationUseCase';
import { GetReceiptTemplatesUseCase } from '@/application/dashboard/billing/use-cases/GetReceiptTemplatesUseCase';
import { CreateSubScenarioPriceUseCase } from '@/application/dashboard/billing/use-cases/CreateSubScenarioPriceUseCase';
import { UpdateSubScenarioPriceUseCase } from '@/application/dashboard/billing/use-cases/UpdateSubScenarioPriceUseCase';
import { GetSubScenarioPriceUseCase } from '@/application/dashboard/billing/use-cases/GetSubScenarioPriceUseCase';
import { DeleteSubScenarioPriceUseCase } from '@/application/dashboard/billing/use-cases/DeleteSubScenarioPriceUseCase';
import { UploadPaymentProofUseCase } from '@/application/dashboard/billing/use-cases/UploadPaymentProofUseCase';

// HTTP Client imports  
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';
import { IActivityAreaRepository } from '@/entities/activity-area/infrastructure/actvity-area-repository.port';

// Infrastructure imports
import { EventBus, createInMemoryEventBus } from '@/shared/infrastructure/InMemoryEventBus';

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

    // console.log('Container created successfully');
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
      .to(() => new NeighborhoodRepositoryAdapter(createHttpClient()))
      .singleton();

    // Activity Area Repository (singleton)
    container.bind<IActivityAreaRepository>(TOKENS.IActivityAreaRepository)
      .to(() => new ActivityAreaRepositoryAdapter(createHttpClient()))
      .singleton();

    // Sub Scenario Repository (singleton)
    container.bind<ISubScenarioRepository>(TOKENS.ISubScenarioRepository)
      .to(() => new SubScenarioRepository(createHttpClient()))
      .singleton();

    // Field Surface Type Repository (singleton)
    container.bind<IFieldSurfaceTypeRepository>(TOKENS.IFieldSurfaceTypeRepository)
      .to(() => new FieldSurfaceTypeRepositoryAdapter(createHttpClient()))
      .singleton();

    // Reservation Repository (singleton)
    container.bind<IReservationRepository>(TOKENS.IReservationRepository)
      .to(() => new ReservationRepository(createHttpClient()))
      .singleton();

    // User Repository (singleton)
    container.bind<IUserRepository>(TOKENS.IUserRepository)
      .to(() => new UserRepositoryAdapter(createHttpClient()))
      .singleton();

    // Role Repository (singleton)
    container.bind<IRoleRepository>(TOKENS.IRoleRepository)
      .to(() => new RoleRepositoryAdapter(createHttpClient()))
      .singleton();

    // Commune Repository (singleton)
    container.bind<ICommuneRepository>(TOKENS.ICommuneRepository)
      .to(() => new CommuneRepository(createHttpClient()))
      .singleton();

    // City Repository (singleton)
    container.bind<ICityRepository>(TOKENS.ICityRepository)
      .to(() => new CityRepository(createHttpClient()))
      .singleton();

    // Billing Repositories (singleton)
    container.bind<IReceiptRepository>(TOKENS.IReceiptRepository)
      .to(() => createReceiptRepository(createHttpClient()))
      .singleton();

    container.bind<ITemplateRepository>(TOKENS.ITemplateRepository)
      .to(() => createTemplateRepository(createHttpClient()))
      .singleton();

    container.bind<IPaymentProofRepository>(TOKENS.IPaymentProofRepository)
      .to(() => createPaymentProofRepository(createHttpClient()))
      .singleton();

    container.bind<ISubScenarioPriceRepository>(TOKENS.ISubScenarioPriceRepository)
      .to(() => createSubScenarioPriceRepository(createHttpClient()))
      .singleton();

    // Event Bus (singleton)
    container.bind<EventBus>(TOKENS.EventBus)
      .to(() => createInMemoryEventBus())
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

    // Get Activity Areas Use Case
    container.bind<GetActivityAreasUseCase>(TOKENS.GetActivityAreasUseCase)
      .to(() => new GetActivityAreasUseCase(
        container.get<IActivityAreaRepository>(TOKENS.IActivityAreaRepository)
      ));

    // Get Field Surface Types Use Case
    container.bind<GetFieldSurfaceTypesUseCase>(TOKENS.GetFieldSurfaceTypesUseCase)
      .to(() => new GetFieldSurfaceTypesUseCase(
        container.get<IFieldSurfaceTypeRepository>(TOKENS.IFieldSurfaceTypeRepository)
      ));

    // Get Sub Scenarios Use Case
    container.bind<GetSubScenariosUseCase>(TOKENS.GetSubScenariosUseCase)
      .to(() => new GetSubScenariosUseCase(
        container.get<ISubScenarioRepository>(TOKENS.ISubScenarioRepository)
      ));

    // Get Scenarios Data Service (application service)
    container.bind<GetScenariosDataService>(TOKENS.GetScenariosDataService)
      .to(() => new GetScenariosDataService(
        container.get<GetScenariosUseCase>(TOKENS.GetScenariosUseCase),
        container.get<GetNeighborhoodsUseCase>(TOKENS.GetNeighborhoodsUseCase)
      ));

    // Get Sub-Scenarios Data Service (application service)
    container.bind<GetSubScenariosDataService>(TOKENS.GetSubScenariosDataService)
      .to(() => new GetSubScenariosDataService(
        container.get<GetScenariosUseCase>(TOKENS.GetScenariosUseCase),
        container.get<GetNeighborhoodsUseCase>(TOKENS.GetNeighborhoodsUseCase),
        container.get<GetActivityAreasUseCase>(TOKENS.GetActivityAreasUseCase),
        container.get<GetFieldSurfaceTypesUseCase>(TOKENS.GetFieldSurfaceTypesUseCase),
        container.get<GetSubScenariosUseCase>(TOKENS.GetSubScenariosUseCase)
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

    // Home Data Service (application service)
    container.bind<GetHomeDataService>(TOKENS.GetHomeDataService)
      .to(() => new GetHomeDataService(
        container.get<GetSubScenariosUseCase>(TOKENS.GetSubScenariosUseCase),
        container.get<GetActivityAreasUseCase>(TOKENS.GetActivityAreasUseCase),
        container.get<GetNeighborhoodsUseCase>(TOKENS.GetNeighborhoodsUseCase),
        container.get<GetFieldSurfaceTypesUseCase>(TOKENS.GetFieldSurfaceTypesUseCase)
      ));

    // Home Data Use Case
    container.bind<GetHomeDataUseCase>(TOKENS.GetHomeDataUseCase)
      .to(() => new GetHomeDataUseCase(
        container.get<GetHomeDataService>(TOKENS.GetHomeDataService)
      ));

    // User Reservations Data Service (application service)
    container.bind<GetUserReservationsDataService>(TOKENS.GetUserReservationsDataService)
      .to(() => new GetUserReservationsDataService(
        container.get<IReservationRepository>(TOKENS.IReservationRepository)
      ));

    // User Reservations Use Case
    container.bind<AppGetUserReservationsUseCase>(TOKENS.GetUserReservationsUseCase)
      .to(() => new AppGetUserReservationsUseCase(
        container.get<GetUserReservationsDataService>(TOKENS.GetUserReservationsDataService)
      ));

    // Get Users Use Case
    container.bind<GetUsersUseCase>(TOKENS.GetUsersUseCase)
      .to(() => new GetUsersUseCase(
        container.get<IUserRepository>(TOKENS.IUserRepository)
      ));

    // Get User By ID Use Case
    container.bind<GetUserByIdUseCase>(TOKENS.GetUserByIdUseCase)
      .to(() => new GetUserByIdUseCase(
        container.get<IUserRepository>(TOKENS.IUserRepository)
      ));

    // Get Roles Use Case
    container.bind<GetRolesUseCase>(TOKENS.GetRolesUseCase)
      .to(() => new GetRolesUseCase(
        container.get<IRoleRepository>(TOKENS.IRoleRepository)
      ));

    // Create User Use Case
    container.bind<CreateUserUseCase>(TOKENS.CreateUserUseCase)
      .to(() => new CreateUserUseCase(
        container.get<IUserRepository>(TOKENS.IUserRepository)
      ));

    // Update User Use Case
    container.bind<UpdateUserUseCase>(TOKENS.UpdateUserUseCase)
      .to(() => new UpdateUserUseCase(
        container.get<IUserRepository>(TOKENS.IUserRepository)
      ));

    // Get Clients Data Service (application service)
    container.bind<GetClientsDataService>(TOKENS.GetClientsDataService)
      .to(() => new GetClientsDataService(
        container.get<GetUsersUseCase>(TOKENS.GetUsersUseCase),
        container.get<GetRolesUseCase>(TOKENS.GetRolesUseCase),
        container.get<GetNeighborhoodsUseCase>(TOKENS.GetNeighborhoodsUseCase)
      ));

    // Get Admin Users Data Service (application service)
    container.bind<GetAdminUsersDataService>(TOKENS.GetAdminUsersDataService)
      .to(() => new GetAdminUsersDataService(
        container.get<GetUsersUseCase>(TOKENS.GetUsersUseCase),
        container.get<GetRolesUseCase>(TOKENS.GetRolesUseCase)
      ));

    // Get Communes Use Case
    container.bind<GetCommunesUseCase>(TOKENS.GetCommunesUseCase)
      .to(() => new GetCommunesUseCase(
        container.get<ICommuneRepository>(TOKENS.ICommuneRepository)
      ));

    // Get Cities Use Case
    container.bind<GetCitiesUseCase>(TOKENS.GetCitiesUseCase)
      .to(() => new GetCitiesUseCase(
        container.get<ICityRepository>(TOKENS.ICityRepository)
      ));

    // Get Locations Data Use Case
    container.bind<GetLocationsDataUseCase>(TOKENS.GetLocationsDataUseCase)
      .to(() => new GetLocationsDataUseCase(
        container.get<GetCommunesUseCase>(TOKENS.GetCommunesUseCase),
        container.get<GetNeighborhoodsUseCase>(TOKENS.GetNeighborhoodsUseCase),
        container.get<GetCitiesUseCase>(TOKENS.GetCitiesUseCase)
      ));

    // Get Locations Data Service (application service)
    container.bind<GetLocationsDataService>(TOKENS.GetLocationsDataService)
      .to(() => new GetLocationsDataService(
        container.get<GetLocationsDataUseCase>(TOKENS.GetLocationsDataUseCase)
      ));

    // Get Scenario Detail Use Case (transient for isolation)
    container.bind<GetScenarioDetailUseCase>(TOKENS.GetScenarioDetailUseCase)
      .to(() => new GetScenarioDetailUseCaseImpl(
        container.get<ISubScenarioRepository>(TOKENS.ISubScenarioRepository),
      ));

    // Get Availability Use Case (transient for isolation)
    container.bind<GetAvailabilityUseCase>(TOKENS.GetAvailabilityUseCase)
      .to(() => new GetAvailabilityUseCaseImpl(
        container.get<IReservationRepository>(TOKENS.IReservationRepository)
      ));

    // =============================================================================
    // BILLING USE CASES
    // =============================================================================

    // Generate Receipt Use Case
    container.bind<GenerateReceiptUseCase>(TOKENS.GenerateReceiptUseCase)
      .to(() => new GenerateReceiptUseCase(
        container.get<IReceiptRepository>(TOKENS.IReceiptRepository)
      ));

    // Send Receipt By Email Use Case
    container.bind<SendReceiptByEmailUseCase>(TOKENS.SendReceiptByEmailUseCase)
      .to(() => new SendReceiptByEmailUseCase(
        container.get<IReceiptRepository>(TOKENS.IReceiptRepository)
      ));

    // Get Receipts By Reservation Use Case
    container.bind<GetReceiptsByReservationUseCase>(TOKENS.GetReceiptsByReservationUseCase)
      .to(() => new GetReceiptsByReservationUseCase(
        container.get<IReceiptRepository>(TOKENS.IReceiptRepository)
      ));

    // Get Receipt Templates Use Case
    container.bind<GetReceiptTemplatesUseCase>(TOKENS.GetReceiptTemplatesUseCase)
      .to(() => new GetReceiptTemplatesUseCase(
        container.get<ITemplateRepository>(TOKENS.ITemplateRepository)
      ));

    // Create Sub-Scenario Price Use Case
    container.bind<CreateSubScenarioPriceUseCase>(TOKENS.CreateSubScenarioPriceUseCase)
      .to(() => new CreateSubScenarioPriceUseCase(
        container.get<ISubScenarioPriceRepository>(TOKENS.ISubScenarioPriceRepository)
      ));

    // Update Sub-Scenario Price Use Case
    container.bind<UpdateSubScenarioPriceUseCase>(TOKENS.UpdateSubScenarioPriceUseCase)
      .to(() => new UpdateSubScenarioPriceUseCase(
        container.get<ISubScenarioPriceRepository>(TOKENS.ISubScenarioPriceRepository)
      ));

    // Get Sub-Scenario Price Use Case
    container.bind<GetSubScenarioPriceUseCase>(TOKENS.GetSubScenarioPriceUseCase)
      .to(() => new GetSubScenarioPriceUseCase(
        container.get<ISubScenarioPriceRepository>(TOKENS.ISubScenarioPriceRepository)
      ));

    // Delete Sub-Scenario Price Use Case
    container.bind<DeleteSubScenarioPriceUseCase>(TOKENS.DeleteSubScenarioPriceUseCase)
      .to(() => new DeleteSubScenarioPriceUseCase(
        container.get<ISubScenarioPriceRepository>(TOKENS.ISubScenarioPriceRepository)
      ));

    // Upload Payment Proof Use Case
    container.bind<UploadPaymentProofUseCase>(TOKENS.UploadPaymentProofUseCase)
      .to(() => new UploadPaymentProofUseCase(
        container.get<IPaymentProofRepository>(TOKENS.IPaymentProofRepository)
      ));
  }

  /**
   * Configure development-specific dependencies
   */
  private static configureDevelopment(container: SimpleContainer): void {
    // Development-specific logging, monitoring, etc.
    // console.log('Development environment configured');
  }

  /**
   * Configure production-specific dependencies
   */
  private static configureProduction(container: SimpleContainer): void {
    // Production optimizations
    console.log('Production environment configured');
  }

  /**
   * Configure testing-specific dependencies (mocks)
   */
  private static configureTesting(container: SimpleContainer): void {
    // Override with mocks for testing
    console.log('Testing environment configured with mocks');
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
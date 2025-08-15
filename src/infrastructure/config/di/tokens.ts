/**
 * Dependency Injection Tokens
 * 
 * Simple string-based tokens for type-safe dependency injection.
 * Using strings instead of Symbols for simplicity and debuggability.
 */

export const TOKENS = {
  // =============================================================================
  // REPOSITORIES (Infrastructure Layer)
  // =============================================================================
  IScenarioRepository: 'IScenarioRepository',
  INeighborhoodRepository: 'INeighborhoodRepository',
  IActivityAreaRepository: 'IActivityAreaRepository',
  ISubScenarioRepository: 'ISubScenarioRepository',
  IFieldSurfaceTypeRepository: 'IFieldSurfaceTypeRepository',
  IUserRepository: 'IUserRepository',
  IRoleRepository: 'IRoleRepository',
  IReservationRepository: 'IReservationRepository',

  // =============================================================================
  // USE CASES - SCENARIO (Application Layer)
  // =============================================================================
  CreateScenarioUseCase: 'CreateScenarioUseCase',
  UpdateScenarioUseCase: 'UpdateScenarioUseCase',
  GetScenariosUseCase: 'GetScenariosUseCase',
  GetScenarioByIdUseCase: 'GetScenarioByIdUseCase',
  DeleteScenarioUseCase: 'DeleteScenarioUseCase',

  // =============================================================================
  // USE CASES - NEIGHBORHOOD (Application Layer)
  // =============================================================================
  GetNeighborhoodsUseCase: 'GetNeighborhoodsUseCase',
  CreateNeighborhoodUseCase: 'CreateNeighborhoodUseCase',
  UpdateNeighborhoodUseCase: 'UpdateNeighborhoodUseCase',

  // =============================================================================
  // USE CASES - ACTIVITY AREA (Application Layer)
  // =============================================================================
  GetActivityAreasUseCase: 'GetActivityAreasUseCase',
  CreateActivityAreaUseCase: 'CreateActivityAreaUseCase',

  // =============================================================================
  // USE CASES - FIELD SURFACE TYPE (Application Layer)
  // =============================================================================
  GetFieldSurfaceTypesUseCase: 'GetFieldSurfaceTypesUseCase',

  // =============================================================================
  // USE CASES - SUB SCENARIO (Application Layer)
  // =============================================================================
  GetSubScenariosUseCase: 'GetSubScenariosUseCase',
  CreateSubScenarioUseCase: 'CreateSubScenarioUseCase',
  UpdateSubScenarioUseCase: 'UpdateSubScenarioUseCase',
  UploadSubScenarioImagesUseCase: 'UploadSubScenarioImagesUseCase',

  // =============================================================================
  // USE CASES - HOME (Application Layer)
  // =============================================================================
  GetHomeDataUseCase: 'GetHomeDataUseCase',

  // =============================================================================
  // USE CASES - RESERVATIONS (Application Layer)
  // =============================================================================
  GetUserReservationsUseCase: 'GetUserReservationsUseCase',

  // =============================================================================
  // USE CASES - USERS/CLIENTS (Application Layer)
  // =============================================================================
  GetUsersUseCase: 'GetUsersUseCase',
  GetUserByIdUseCase: 'GetUserByIdUseCase',
  GetRolesUseCase: 'GetRolesUseCase',

  // =============================================================================
  // APPLICATION SERVICES (Cross-Domain Operations)
  // =============================================================================
  GetScenariosDataService: 'GetScenariosDataService',
  GetSubScenariosDataService: 'GetSubScenariosDataService',
  GetHomeDataService: 'GetHomeDataService',
  GetUserReservationsDataService: 'GetUserReservationsDataService',
  GetClientsDataService: 'GetClientsDataService',

  // =============================================================================
  // INFRASTRUCTURE SERVICES
  // =============================================================================
  HttpClient: 'HttpClient',
  AuthContext: 'AuthContext',
  Logger: 'Logger',
  ErrorHandler: 'ErrorHandler',

  // =============================================================================
  // CONFIGURATION
  // =============================================================================
  Environment: 'Environment',
  ApiConfig: 'ApiConfig',
} as const;

/**
 * Type helper to ensure type safety when requesting dependencies
 */
export type TokenKey = keyof typeof TOKENS;
export type TokenValue = typeof TOKENS[TokenKey];

/**
 * Type helper for dependency identifiers
 */
export type DependencyToken<T> = string;

/**
 * Environment types for container configuration
 */
export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

/**
 * Lifecycle scopes for dependency management
 */
export enum LifecycleScope {
  SINGLETON = 'singleton',    // One instance for the entire application
  TRANSIENT = 'transient',    // New instance every time
  SCOPED = 'scoped',          // One instance per request/scope
}
/**
 * Dependency Injection Types & Symbols
 * 
 * Centralized registry of all dependency identifiers for type-safe injection.
 * Uses Symbol.for() to ensure uniqueness across the application.
 */

export const TYPES = {
  // =============================================================================
  // REPOSITORIES (Infrastructure Layer)
  // =============================================================================
  IScenarioRepository: Symbol.for("IScenarioRepository"),
  INeighborhoodRepository: Symbol.for("INeighborhoodRepository"),
  IActivityAreaRepository: Symbol.for("IActivityAreaRepository"),
  ISubScenarioRepository: Symbol.for("ISubScenarioRepository"),

  // =============================================================================
  // USE CASES - SCENARIO (Application Layer)
  // =============================================================================
  CreateScenarioUseCase: Symbol.for("CreateScenarioUseCase"),
  UpdateScenarioUseCase: Symbol.for("UpdateScenarioUseCase"),
  GetScenariosUseCase: Symbol.for("GetScenariosUseCase"),
  GetScenarioByIdUseCase: Symbol.for("GetScenarioByIdUseCase"),
  DeleteScenarioUseCase: Symbol.for("DeleteScenarioUseCase"),

  // =============================================================================
  // USE CASES - NEIGHBORHOOD (Application Layer)
  // =============================================================================
  GetNeighborhoodsUseCase: Symbol.for("GetNeighborhoodsUseCase"),
  CreateNeighborhoodUseCase: Symbol.for("CreateNeighborhoodUseCase"),
  UpdateNeighborhoodUseCase: Symbol.for("UpdateNeighborhoodUseCase"),

  // =============================================================================
  // USE CASES - ACTIVITY AREA (Application Layer)
  // =============================================================================
  GetActivityAreasUseCase: Symbol.for("GetActivityAreasUseCase"),
  CreateActivityAreaUseCase: Symbol.for("CreateActivityAreaUseCase"),

  // =============================================================================
  // USE CASES - SUB SCENARIO (Application Layer)
  // =============================================================================
  GetSubScenariosUseCase: Symbol.for("GetSubScenariosUseCase"),
  CreateSubScenarioUseCase: Symbol.for("CreateSubScenarioUseCase"),
  UpdateSubScenarioUseCase: Symbol.for("UpdateSubScenarioUseCase"),

  // =============================================================================
  // COMPOSITE USE CASES (Cross-Domain Operations)
  // =============================================================================
  GetScenariosDataUseCase: Symbol.for("GetScenariosDataUseCase"),

  // =============================================================================
  // INFRASTRUCTURE SERVICES
  // =============================================================================
  HttpClient: Symbol.for("HttpClient"),
  AuthContext: Symbol.for("AuthContext"),
  Logger: Symbol.for("Logger"),
  ErrorHandler: Symbol.for("ErrorHandler"),

  // =============================================================================
  // CONFIGURATION
  // =============================================================================
  Environment: Symbol.for("Environment"),
  ApiConfig: Symbol.for("ApiConfig"),
} as const;

/**
 * Type helper to ensure type safety when requesting dependencies
 */
export type DependencyIdentifier<T> = symbol;

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

/**
 * Data Transfer Object (DTO) Types
 * DTOs for CRUD operations migrated from legacy services/api.ts
 */

// Commune DTOs
export interface CreateCommuneDto {
  name: string;
  cityId: number;
}

export interface UpdateCommuneDto {
  name?: string;
  cityId?: number;
}

// Neighborhood DTOs
export interface CreateNeighborhoodDto {
  name: string;
  communeId: number;
}

export interface UpdateNeighborhoodDto {
  name?: string;
  communeId?: number;
}

// Scenario DTOs
export interface CreateScenarioDto {
  name: string;
  address: string;
  neighborhoodId: number;
}

export interface UpdateScenarioDto {
  name?: string;
  address?: string;
  neighborhoodId?: number;
  isActive?: boolean;
}

// Sub-scenario DTOs
export interface CreateSubScenarioDto {
  name: string;
  active?: boolean;
  hasCost?: boolean;
  numberOfSpectators?: number;
  numberOfPlayers?: number;
  recommendations?: string;
  scenarioId: number;
  activityAreaId?: number;
  fieldSurfaceTypeId?: number;
}

export interface UpdateSubScenarioDto {
  name?: string;
  active?: boolean;
  hasCost?: boolean;
  numberOfSpectators?: number;
  numberOfPlayers?: number;
  recommendations?: string;
  activityAreaId?: number;
  fieldSurfaceTypeId?: number;
}
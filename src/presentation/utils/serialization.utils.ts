// Presentation Layer: Serialization utilities
// Handles conversion from Domain Entities to plain objects for Next.js Client Components

import { ActivityAreaEntity, ActivityAreaPlainObject } from '@/entities/activity-area/domain/ActivityAreaEntity';
import { NeighborhoodEntity, NeighborhoodPlainObject } from '@/entities/neighborhood/domain/NeighborhoodEntity';
import { FieldSurfaceTypeEntity, FieldSurfaceTypePlainObject } from '@/entities/field-surface-type/domain/FieldSurfaceTypeEntity';
import { ScenarioEntity, ScenarioPlainObject } from '@/entities/scenario/domain/ScenarioEntity';
import { SubScenarioEntity, SubScenarioPlainObject } from '@/entities/sub-scenario/domain/SubScenarioEntity';
import { ISubScenariosDataResponse } from '@/application/dashboard/sub-scenarios/services/GetSubScenariosDataService';

// Serialized version of ISubScenariosDataResponse for client components
export interface ISubScenariosDataClientResponse {
  subScenarios: SubScenarioPlainObject[]; // Serialized from domain entities
  scenarios: ScenarioPlainObject[]; // Serialized from domain entities
  activityAreas: ActivityAreaPlainObject[]; // Serialized from domain entities
  neighborhoods: NeighborhoodPlainObject[]; // Serialized from domain entities
  fieldSurfaceTypes: FieldSurfaceTypePlainObject[]; // Serialized from domain entities
  meta: any;           // Keep as-is (already plain object from API)
  filters: any;        // Keep as-is (already plain object)
}

/**
 * Serializes ActivityAreaEntity[] to plain objects for client components
 */
export function serializeActivityAreas(entities: ActivityAreaEntity[]): ActivityAreaPlainObject[] {
  return entities.map(entity => entity.toPlainObject());
}

/**
 * Serializes NeighborhoodEntity[] to plain objects for client components
 */
export function serializeNeighborhoods(entities: NeighborhoodEntity[]): NeighborhoodPlainObject[] {
  return entities.map(entity => entity.toPlainObject());
}

/**
 * Serializes FieldSurfaceTypeEntity[] to plain objects for client components
 */
export function serializeFieldSurfaceTypes(entities: FieldSurfaceTypeEntity[]): FieldSurfaceTypePlainObject[] {
  return entities.map(entity => entity.toPlainObject());
}

/**
 * Serializes ScenarioEntity[] to plain objects for client components
 */
export function serializeScenarios(entities: ScenarioEntity[]): ScenarioPlainObject[] {
  return entities.map(entity => entity.toPlainObject());
}

/**
 * Serializes SubScenarioEntity[] to plain objects for client components
 */
export function serializeSubScenarios(entities: SubScenarioEntity[]): SubScenarioPlainObject[] {
  return entities.map(entity => entity.toPlainObject());
}

/**
 * Serializes complete SubScenariosDataResponse for client components
 * This is the presentation layer's responsibility - not the application service
 */
export function serializeSubScenariosData(
  domainResponse: ISubScenariosDataResponse
): ISubScenariosDataClientResponse {
  return {
    subScenarios: serializeSubScenarios(domainResponse.subScenarios), // Serialize domain entities
    scenarios: serializeScenarios(domainResponse.scenarios), // Serialize domain entities
    activityAreas: serializeActivityAreas(domainResponse.activityAreas), // Serialize domain entities
    neighborhoods: serializeNeighborhoods(domainResponse.neighborhoods), // Serialize domain entities
    fieldSurfaceTypes: serializeFieldSurfaceTypes(domainResponse.fieldSurfaceTypes), // Serialize domain entities
    meta: domainResponse.meta,
    filters: domainResponse.filters,
  };
}

/**
 * Generic serializer for domain entities that have toPlainObject method
 */
export function serializeDomainEntity<TEntity extends { toPlainObject(): any }>(
  entity: TEntity
): ReturnType<TEntity['toPlainObject']> {
  return entity.toPlainObject();
}

/**
 * Generic serializer for arrays of domain entities
 */
export function serializeDomainEntities<TEntity extends { toPlainObject(): any }>(
  entities: TEntity[]
): ReturnType<TEntity['toPlainObject']>[] {
  return entities.map(entity => serializeDomainEntity(entity));
}
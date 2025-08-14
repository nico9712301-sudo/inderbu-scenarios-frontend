// Presentation Layer: Serialization utilities
// Handles conversion from Domain Entities to plain objects for Next.js Client Components

import { ActivityAreaEntity, ActivityAreaPlainObject } from '@/entities/activity-area/domain/ActivityAreaEntity';
import { NeighborhoodEntity, NeighborhoodPlainObject } from '@/entities/neighborhood/domain/NeighborhoodEntity';
import { FieldSurfaceTypeEntity, FieldSurfaceTypePlainObject } from '@/entities/field-surface-type/domain/FieldSurfaceTypeEntity';
import { ScenarioEntity, ScenarioPlainObject } from '@/entities/scenario/domain/ScenarioEntity';
import { SubScenarioEntity, SubScenarioPlainObject } from '@/entities/sub-scenario/domain/SubScenarioEntity';
import { ISubScenariosDataResponse } from '@/application/dashboard/sub-scenarios/services/GetSubScenariosDataService';
import { IUserReservationsDataResponse } from '@/application/reservations/services/GetUserReservationsDataService';
import { IScenariosDataResponse } from '@/application/dashboard/scenarios/services/GetScenariosDataService';
import { IClientsDataResponse, RoleEntity } from '@/application/dashboard/clients/services/GetClientsDataService';
import { ReservationEntity, ReservationPlainObject } from '@/entities/reservation/domain/ReservationEntity';
import { UserEntity, UserPlainObject } from '@/entities/user/domain/UserEntity';
import { IHomeDataResponse } from '@/application/home/services/GetHomeDataService';

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

// Serialized version of IHomeDataResponse for client components
export interface IHomeDataClientResponse {
  subScenarios: SubScenarioPlainObject[]; // Serialized from domain entities
  activityAreas: ActivityAreaPlainObject[]; // Serialized from domain entities
  neighborhoods: NeighborhoodPlainObject[]; // Serialized from domain entities
  fieldSurfaceTypes: FieldSurfaceTypePlainObject[]; // Serialized from domain entities
  meta: any;           // Keep as-is (already plain object from API)
  filters: any;        // Keep as-is (already plain object)
}

// Serialized version of IUserReservationsDataResponse for client components
export interface IUserReservationsDataClientResponse {
  reservations: ReservationPlainObject[]; // Serialized from domain entities
  meta: any;           // Keep as-is (already plain object from API)
  metadata: any;       // Keep as-is (already plain object)
}

// Serialized version of IScenariosDataResponse for client components
export interface IScenariosDataClientResponse {
  scenarios: ScenarioPlainObject[]; // Serialized from domain entities
  neighborhoods: NeighborhoodPlainObject[]; // Serialized from domain entities
  meta: any;           // Keep as-is (already plain object from API)
  filters: any;        // Keep as-is (already plain object)
}

// Serialized version of IClientsDataResponse for client components
export interface IClientsDataClientResponse {
  users: UserPlainObject[]; // Serialized from domain entities
  roles: RoleEntity[];     // Keep as-is (simple objects, no domain entity)
  neighborhoods: NeighborhoodPlainObject[]; // Serialized from domain entities
  meta: any;           // Keep as-is (already plain object from API)
  filters: any;        // Keep as-is (already plain object)
  filterOptions: any;  // Keep as-is (already plain object)
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
 * Serializes ReservationEntity[] to plain objects for client components
 */
export function serializeReservations(entities: ReservationEntity[]): ReservationPlainObject[] {
  return entities.map(entity => entity.toPlainObject());
}

/**
 * Serializes UserEntity[] to plain objects for client components
 */
export function serializeUsers(entities: UserEntity[]): UserPlainObject[] {
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

/**
 * Serializes complete HomeDataResponse for client components
 * This is the presentation layer's responsibility - not the application service
 */
export function serializeHomeData(
  domainResponse: IHomeDataResponse
): IHomeDataClientResponse {
  return {
    subScenarios: serializeSubScenarios(domainResponse.subScenarios), // Serialize domain entities
    activityAreas: serializeActivityAreas(domainResponse.activityAreas), // Serialize domain entities
    neighborhoods: serializeNeighborhoods(domainResponse.neighborhoods), // Serialize domain entities
    fieldSurfaceTypes: serializeFieldSurfaceTypes(domainResponse.fieldSurfaceTypes), // Serialize domain entities
    meta: domainResponse.meta,
    filters: domainResponse.filters,
  };
}

/**
 * Serializes complete UserReservationsDataResponse for client components
 * This is the presentation layer's responsibility - not the application service
 */
export function serializeUserReservationsData(
  domainResponse: IUserReservationsDataResponse
): IUserReservationsDataClientResponse {
  return {
    reservations: serializeReservations(domainResponse.reservations), // Serialize domain entities
    meta: domainResponse.meta,
    metadata: domainResponse.metadata,
  };
}

/**
 * Serializes complete ScenariosDataResponse for client components
 * This is the presentation layer's responsibility - not the application service
 */
export function serializeScenariosData(
  domainResponse: IScenariosDataResponse
): IScenariosDataClientResponse {
  return {
    scenarios: serializeScenarios(domainResponse.scenarios), // Serialize domain entities
    neighborhoods: serializeNeighborhoods(domainResponse.neighborhoods), // Serialize domain entities
    meta: domainResponse.meta,
    filters: domainResponse.filters,
  };
}

/**
 * Serializes complete ClientsDataResponse for client components
 * This is the presentation layer's responsibility - not the application service
 */
export function serializeClientsData(
  domainResponse: IClientsDataResponse
): IClientsDataClientResponse {
  return {
    users: serializeUsers(domainResponse.users), // Serialize domain entities
    roles: domainResponse.roles, // Keep as-is (simple objects, no domain entity)
    neighborhoods: serializeNeighborhoods(domainResponse.neighborhoods), // Serialize domain entities
    meta: domainResponse.meta,
    filters: domainResponse.filters,
    filterOptions: domainResponse.filterOptions,
  };
}
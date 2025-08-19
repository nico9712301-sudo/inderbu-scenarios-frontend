// Entities
import { FieldSurfaceTypeEntity, FieldSurfaceTypePlainObject } from '@/entities/field-surface-type/domain/FieldSurfaceTypeEntity';
import { ActivityAreaEntity, ActivityAreaPlainObject } from '@/entities/activity-area/domain/ActivityAreaEntity';
import { NeighborhoodEntity, NeighborhoodPlainObject } from '@/entities/neighborhood/domain/NeighborhoodEntity';
import { SubScenarioEntity, SubScenarioPlainObject } from '@/entities/sub-scenario/domain/SubScenarioEntity';
import { ReservationEntity, ReservationPlainObject } from '@/entities/reservation/domain/ReservationEntity';
import { ScenarioEntity, ScenarioPlainObject } from '@/entities/scenario/domain/ScenarioEntity';
import { UserEntity, UserPlainObject } from '@/entities/user/domain/UserEntity';
import { RoleEntity, RolePlainObject } from '@/entities/role/domain/RoleEntity';
import { CommuneEntity, CommunePlainObject } from '@/entities/commune/domain/CommuneEntity';
import { CityEntity, CityPlainObject } from '@/entities/city/domain/CityEntity';

// Application Layer
import { ISubScenariosDataResponse } from '@/application/dashboard/sub-scenarios/services/GetSubScenariosDataService';
import { IUserReservationsDataResponse } from '@/application/reservations/services/GetUserReservationsDataService';
import { IScenariosDataResponse } from '@/application/dashboard/scenarios/services/GetScenariosDataService';
import { IClientsDataResponse } from '@/application/dashboard/clients/services/GetClientsDataService';
import { IAdminUsersDataResponse } from '@/application/dashboard/admin-users/services/GetAdminUsersDataService';
import { SubScenarioBackend } from '@/infrastructure/transformers/SubScenarioTransformer';
import { IHomeDataResponse } from '@/application/home/services/GetHomeDataService';
import { AvailabilityResult } from '@/application/availability/use-cases/GetAvailabilityUseCase';
import { ILocationsDataResponse } from '@/application/dashboard/locations/services/GetLocationsDataService';

// Presentation Layer

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
  roles: RolePlainObject[]; // Serialized from domain entities
  neighborhoods: NeighborhoodPlainObject[]; // Serialized from domain entities
  meta: any;           // Keep as-is (already plain object from API)
  filters: any;        // Keep as-is (already plain object)
}

// Serialized version of IAdminUsersDataResponse for client components
export interface IAdminUsersDataClientResponse {
  users: UserPlainObject[]; // Serialized from domain entities (admin only)
  roles: RolePlainObject[]; // Serialized from domain entities (admin roles only)
  meta: any;           // Keep as-is (already plain object from API)
  filters: any;        // Keep as-is (already plain object)
  filterOptions: any;  // Keep as-is (already plain object)
}

// Serialized version of ILocationsDataResponse for client components
export interface ILocationsDataClientResponse {
  communes: CommunePlainObject[]; // Serialized from domain entities
  neighborhoods: NeighborhoodPlainObject[]; // Serialized from domain entities
  cities: CityPlainObject[]; // Serialized from domain entities
  communePageMeta: any; // Keep as-is (already plain object from API)
  neighborhoodPageMeta: any; // Keep as-is (already plain object from API)
  communeFilters: any; // Keep as-is (already plain object)
  neighborhoodFilters: any; // Keep as-is (already plain object)
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
 * Serializes RoleEntity[] to plain objects for client components
 */
export function serializeRoles(entities: RoleEntity[]): RolePlainObject[] {
  return entities.map(entity => entity.toPlainObject());
}

/**
 * Serializes CommuneEntity[] to plain objects for client components
 */
export function serializeCommunes(entities: CommuneEntity[]): CommunePlainObject[] {
  return entities.map(entity => entity.toPlainObject());
}

/**
 * Serializes CityEntity[] to plain objects for client components
 */
export function serializeCities(entities: CityEntity[]): CityPlainObject[] {
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
    roles: serializeRoles(domainResponse.roles), // Serialize domain entities
    neighborhoods: serializeNeighborhoods(domainResponse.neighborhoods), // Serialize domain entities
    meta: domainResponse.meta,
    filters: domainResponse.filters,
  };
}

/**
 * Serializes complete AdminUsersDataResponse for client components
 * This is the presentation layer's responsibility - not the application service
 */
export function serializeAdminUsersData(
  domainResponse: IAdminUsersDataResponse
): IAdminUsersDataClientResponse {
  return {
    users: serializeUsers(domainResponse.users), // Serialize domain entities (admin only)
    roles: serializeRoles(domainResponse.roles), // Serialize domain entities (admin roles only)
    meta: domainResponse.meta,
    filters: domainResponse.filters,
    filterOptions: domainResponse.filterOptions,
  };
}

/**
 * Serializes complete LocationsDataResponse for client components
 * This is the presentation layer's responsibility - not the application service
 */
export function serializeLocationsData(
  domainResponse: ILocationsDataResponse
): ILocationsDataClientResponse {
  return {
    communes: serializeCommunes(domainResponse.communes), // Serialize domain entities
    neighborhoods: serializeNeighborhoods(domainResponse.neighborhoods), // Serialize domain entities
    cities: serializeCities(domainResponse.cities), // Serialize domain entities
    communePageMeta: domainResponse.communePageMeta,
    neighborhoodPageMeta: domainResponse.neighborhoodPageMeta,
    communeFilters: domainResponse.communeFilters,
    neighborhoodFilters: domainResponse.neighborhoodFilters,
  };
}

// Serialized version of ScenarioDetail for client components
export interface SerializedScenarioDetail {
  id: number;
  name: string;
  hasCost: boolean;
  numberOfSpectators: number;
  numberOfPlayers: number;
  recommendations: string;
  scenario: {
    id: number;
    name: string;
    address: string;
    neighborhood: { id: number; name: string };
  };
  activityArea: { id: number; name: string };
  fieldSurfaceType: { id: number; name: string };
  imageGallery?: {
    featured?: {
      id: number;
      path: string;
      url: string;
      isFeature: boolean;
      displayOrder: number;
      subScenarioId: number;
      current?: boolean;
      createdAt: string;
    };
    additional: any[];
    count: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Serialized version of GetScenarioDetailResponse for client components
export interface SerializedScenarioDetailResponse {
  scenario: SubScenarioBackend;
}

/**
 * Serializes a SubScenarioEntity to SerializedScenarioDetail format
 * Preserves all information including imageGallery structure
 */
export function serializeSubScenarioAsScenarioDetail(
  subScenario: SubScenarioEntity
): SerializedScenarioDetail {
  return {
    id: subScenario.id!,
    name: subScenario.name,
    hasCost: subScenario.hasCost,
    numberOfSpectators: subScenario.numberOfSpectators,
    numberOfPlayers: subScenario.numberOfPlayers,
    recommendations: subScenario.recommendations,
    scenario: {
      id: subScenario.scenario.id,
      name: subScenario.scenario.name,
      address: subScenario.scenario.address,
      neighborhood: subScenario.scenario.neighborhood || { id: 0, name: 'Sin barrio' },
    },
    activityArea: {
      id: subScenario.activityArea.id,
      name: subScenario.activityArea.name,
    },
    fieldSurfaceType: {
      id: subScenario.fieldSurfaceType.id,
      name: subScenario.fieldSurfaceType.name,
    },
    imageGallery: subScenario.imageGallery ? {
      featured: subScenario.imageGallery.featured ? {
        id: subScenario.imageGallery.featured.id,
        path: subScenario.imageGallery.featured.path,
        url: subScenario.imageGallery.featured.url,
        isFeature: subScenario.imageGallery.featured.isFeature,
        displayOrder: subScenario.imageGallery.featured.displayOrder,
        subScenarioId: subScenario.imageGallery.featured.subScenarioId,
        current: (subScenario.imageGallery.featured as any).current,
        createdAt: subScenario.imageGallery.featured.createdAt,
      } : undefined,
      additional: subScenario.imageGallery.additional || [],
      count: subScenario.imageGallery.count,
    } : undefined,
    createdAt: subScenario.createdAt?.toISOString(),
    updatedAt: subScenario.updatedAt?.toISOString(),
  };
}

/**
 * Serializes a ScenarioDetail to SerializedScenarioDetail format
 * Handles Date to string conversion and ensures all data is serializable
 */
export function serializeScenarioDetail(subScenario: SubScenarioEntity): SubScenarioBackend {

  return {
    id: subScenario.id,
    name: subScenario.name,
    hasCost: subScenario.hasCost,
    numberOfSpectators: subScenario.numberOfSpectators,
    numberOfPlayers: subScenario.numberOfPlayers,
    recommendations: subScenario.recommendations,
    scenario: {
      id: subScenario.scenario.id,
      name: subScenario.scenario.name,
      address: subScenario.scenario.address,
      neighborhood: subScenario.scenario.neighborhood,
    },
    activityArea: {
      id: subScenario.activityArea.id,
      name: subScenario.activityArea.name,
    },
    fieldSurfaceType: {
      id: subScenario.fieldSurfaceType.id,
      name: subScenario.fieldSurfaceType.name,
    },
    imageGallery: subScenario.imageGallery ? {
      featured: subScenario.imageGallery.featured ? {
        id: subScenario.imageGallery.featured.id,
        path: subScenario.imageGallery.featured.path,
        url: subScenario.imageGallery.featured.url,
        isFeature: subScenario.imageGallery.featured.isFeature,
        displayOrder: subScenario.imageGallery.featured.displayOrder,
        subScenarioId: subScenario.imageGallery.featured.subScenarioId,
        current: subScenario.imageGallery.featured.current,
        createdAt: subScenario.imageGallery.featured.createdAt,
      } : undefined,
      additional: subScenario.imageGallery.additional || [],
      count: subScenario.imageGallery.count,
    } : undefined,
  };
}

/**
 * Serializes ScenarioDetailResponse for client components
 * This handles the specific structure returned by GetScenarioDetailUseCase
 */
export function serializeScenarioDetailData(
  domainResponse: SubScenarioEntity
): SerializedScenarioDetailResponse {
  return {
    scenario: serializeScenarioDetail(domainResponse),
  };
}

// Serialized version of AvailabilityResult for client components
export interface SerializedAvailabilityResponse {
  subScenarioId: number;
  requestedConfiguration: {
    initialDate: string;
    finalDate?: string;
    weekdays?: number[];
  };
  calculatedDates: string[];
  timeSlots: {
    id: number;
    startTime: string;
    endTime: string;
    isAvailableInAllDates: boolean;
  }[];
  stats: {
    totalDates: number;
    totalTimeslots: number;
    totalSlots: number;
    availableSlots: number;
    occupiedSlots: number;
    globalAvailabilityPercentage: number;
    datesWithFullAvailability: number;
    datesWithNoAvailability: number;
  };
  queriedAt: string;
}

/**
 * Serializes AvailabilityResult for client components
 * Handles the availability data structure for SSR
 */
export function serializeAvailabilityData(
  availabilityResult: AvailabilityResult
): SerializedAvailabilityResponse {
  return {
    subScenarioId: availabilityResult.subScenarioId,
    requestedConfiguration: availabilityResult.requestedConfiguration,
    calculatedDates: availabilityResult.calculatedDates,
    timeSlots: availabilityResult.timeSlots.map(slot => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailableInAllDates: slot.isAvailableInAllDates,
    })),
    stats: {
      totalDates: availabilityResult.stats.totalDates,
      totalTimeslots: availabilityResult.stats.totalTimeslots,
      totalSlots: availabilityResult.stats.totalSlots,
      availableSlots: availabilityResult.stats.availableSlots,
      occupiedSlots: availabilityResult.stats.occupiedSlots,
      globalAvailabilityPercentage: availabilityResult.stats.globalAvailabilityPercentage,
      datesWithFullAvailability: availabilityResult.stats.datesWithFullAvailability,
      datesWithNoAvailability: availabilityResult.stats.datesWithNoAvailability,
    },
    queriedAt: availabilityResult.queriedAt,
  };
}
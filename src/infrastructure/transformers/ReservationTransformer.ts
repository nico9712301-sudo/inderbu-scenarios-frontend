// Infrastructure: Reservation Domain Transformer
// Bidirectional conversion between backend API types and domain entities

import { ReservationEntity } from '@/entities/reservation/domain/ReservationEntity';
import { createDomainTransformer, IDomainTransformer } from './DomainTransformer';

// Backend reservation type (matching API response)
export interface ReservationBackend {
  id: number;
  type: "SINGLE" | "RANGE";
  subScenarioId: number;
  userId: number;
  initialDate: string;
  finalDate: string | null;
  weekDays: number[] | null;
  comments?: string | null;
  reservationStateId: number;
  totalInstances: number;
  createdAt: string;
  updatedAt: string;
  subScenario: {
    id: number;
    name: string;
    hasCost?: boolean;
    numberOfSpectators?: number | null;
    numberOfPlayers?: number | null;
    recommendations?: string | null;
    scenarioId?: number;
    scenarioName?: string;
    scenario?: {
      id: number;
      name: string;
      address: string;
      neighborhood: {
        id: number;
        name: string;
        commune: {
          id: number;
          name: string;
          city: {
            id: number;
            name: string;
          };
        };
      };
    };
  };
  user: {
    id: number;
    firstName?: string;
    lastName?: string;
    first_name?: string;  // Backend inconsistency
    last_name?: string;   // Backend inconsistency
    email: string;
    phone?: string | null;
  };
  reservationState: {
    id: number;
    state?: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "CANCELADA";
    name?: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "CANCELADA";  // Backend inconsistency
  };
  timeslots?: {
    id: number;
    startTime: string;
    endTime: string;
  }[];
  timeSlot?: {  // Legacy support
    id: number;
    startTime: string;
    endTime: string;
  };
  reservationDate?: string;  // Legacy support
}

// Validation functions
function isValidReservationBackend(data: any): data is ReservationBackend {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'number' &&
    data.id > 0 &&
    data.subScenario &&
    typeof data.subScenario.id === 'number' &&
    data.user &&
    typeof data.user.id === 'number' &&
    data.reservationState &&
    typeof data.reservationState.id === 'number'
  );
}

function isValidReservationDomain(entity: any): entity is ReservationEntity {
  return (
    entity instanceof ReservationEntity &&
    typeof entity.id === 'number' &&
    entity.id > 0 &&
    entity.subScenario &&
    typeof entity.subScenario.id === 'number' &&
    entity.user &&
    typeof entity.user.id === 'number'
  );
}

// Create the transformer using the generic factory
export const ReservationTransformer: IDomainTransformer<ReservationBackend, ReservationEntity> = 
  createDomainTransformer(
    // Backend → Domain transformation
    (backendData: ReservationBackend): ReservationEntity => {
      // Handle backend inconsistencies
      const normalizedData = {
        ...backendData,
        user: {
          ...backendData.user,
          firstName: backendData.user.firstName || backendData.user.first_name || '',
          lastName: backendData.user.lastName || backendData.user.last_name || '',
        },
        reservationState: {
          ...backendData.reservationState,
          state: backendData.reservationState.state || backendData.reservationState.name || 'PENDIENTE'
        },
        timeslots: backendData.timeslots || (backendData.timeSlot ? [backendData.timeSlot] : [])
      };

      return ReservationEntity.fromApiData(normalizedData);
    },

    // Domain → Backend transformation  
    (domainEntity: ReservationEntity): ReservationBackend => {
      return {
        id: domainEntity.id,
        type: domainEntity.type,
        subScenarioId: domainEntity.subScenarioId,
        userId: domainEntity.userId,
        initialDate: domainEntity.initialDate,
        finalDate: domainEntity.finalDate,
        weekDays: domainEntity.weekDays,
        comments: domainEntity.comments,
        reservationStateId: domainEntity.reservationStateId,
        totalInstances: domainEntity.totalInstances,
        createdAt: domainEntity.createdAt,
        updatedAt: domainEntity.updatedAt,
        subScenario: domainEntity.subScenario,
        user: {
          id: domainEntity.user.id,
          firstName: domainEntity.user.firstName,
          lastName: domainEntity.user.lastName,
          email: domainEntity.user.email,
          phone: domainEntity.user.phone
        },
        reservationState: domainEntity.reservationState,
        timeslots: domainEntity.timeslots
      };
    },

    // Validation functions
    isValidReservationBackend,
    isValidReservationDomain
  );
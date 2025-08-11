// FSD: Barrel exports for Reservations DI Containers

// TEMPORARILY DISABLED: Server-only containers moved to .server.ts files
// These containers contain server-only dependencies and caused ModuleBuildError
// when included in client-side code.
//
// MOVED TO: ReservationsContainer.server.ts
// USAGE: Only import in server components or server actions
//
// For client-side reservation operations, use:
// - useReservationsWidget hook
// - ReservationRepository with ClientHttpClient
// - Client-side components

/*
// User Reservations (List) Container - SERVER ONLY
export { 
  createUserReservationsContainer,
  type UserReservationsContainer,
  type UserReservationsDependencies
} from './ReservationsContainer.server';

// Create Reservation Container (TODO) - SERVER ONLY
export { 
  createCreateReservationContainer,
  type CreateReservationContainer,
  type CreateReservationDependencies
} from './ReservationsContainer.server';

// Cancel Reservation Container (TODO) - SERVER ONLY
export { 
  createCancelReservationContainer,
  type CancelReservationContainer,
  type CancelReservationDependencies
} from './ReservationsContainer.server';

// Re-export main container for convenience - SERVER ONLY
export { createUserReservationsContainer as createReservationsContainer } from './ReservationsContainer.server';
*/

// FOR CLIENT-SIDE USAGE:
// import { useReservationsWidget } from '@/widgets/reservations-list';
// import { createReservationRepository } from '@/entities/reservation/api/reservationRepository';
// import { ClientHttpClientFactory } from '@/shared/api/http-client-client';

// Placeholder exports to prevent import errors
export const RESERVATIONS_DI_CONTAINERS_MOVED_TO_SERVER = true;

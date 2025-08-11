import { createReservationRepository, ReservationRepository } from '@/entities/reservation/infrastructure/reservation-repository.adapter';
import { createUserRepository, UserRepository } from '@/entities/user/infrastructure/user-repository.adapter';
import { createInMemoryEventBus } from '@/shared/infrastructure/InMemoryEventBus';
import { EventBus } from '@/entities/reservation/domain/reservation.domain';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';
import { createServerReservationService, ServerReservationService } from '../use-cases/list/infrastructure/ServerReservationService';
import { createGetUserReservationsUseCase, GetUserReservationsUseCase } from '../use-cases/list/application/GetUserReservationsUseCase';

// DDD: Dependency Injection Containers for Reservations Feature

// Container for User Reservations List Use Case
export interface UserReservationsContainer {
  reservationService: ServerReservationService;
  getUserReservationsUseCase: GetUserReservationsUseCase;
}

/**
 * Creates and wires all dependencies for the list user reservations use case
 * Following DDD layered architecture with proper dependency injection
 * 
 * This container is responsible for:
 * - Setting up infrastructure dependencies (HTTP client, auth context)
 * - Creating repositories for user and reservations
 * - Initializing event bus for domain events
 * - Wiring application use cases (business logic)
 * - Exposing services for external API consumption
 * 
 * @returns {UserReservationsContainer} - Fully initialized DI container for user reservations
 * 
 */
export function createUserReservationsContainer(): UserReservationsContainer {
  console.log('Building UserReservations DI Container...');

  // Infrastructure layer: HTTP Client and Auth
  const authContext = createServerAuthContext();
  const httpClient = ClientHttpClientFactory.createClient(authContext);

  // Infrastructure layer: Use existing repositories directly
  // No adapters needed - existing interfaces are sufficient for our domain
  const userRepo: UserRepository = createUserRepository(httpClient);
  const reservationRepo: ReservationRepository = createReservationRepository(httpClient);

  // Infrastructure layer: Event Bus
  const eventBus: EventBus = createInMemoryEventBus();

  // Application layer: Use Cases (Business Logic)
  const getUserReservationsUseCase: GetUserReservationsUseCase = createGetUserReservationsUseCase(
    reservationRepo,
    userRepo,
    eventBus
  );

  // Infrastructure layer: Service (External API)
  const reservationService: ServerReservationService = createServerReservationService(
    getUserReservationsUseCase
  );

  console.log('UserReservations DI Container ready');

  return {
    reservationService,
    getUserReservationsUseCase
  };
}
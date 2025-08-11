import { GetDashboardReservationsUseCase } from '../application/GetDashboardReservationsUseCase';
import { DashboardReservationsService } from '../domain/DashboardReservationsService';
import { ReservationRepository } from '../infrastructure/ReservationRepository';
import { IReservationRepository } from '../domain/repositories/IReservationRepository';

export interface DashboardReservationsContainer {
  reservationService: DashboardReservationsService;
}

export function createDashboardReservationsContainer(): DashboardReservationsContainer {
  // DDD: Dependency injection - build complete container with repositories
  
  // Infrastructure layer - Repository implementations
  const reservationRepository: IReservationRepository = new ReservationRepository();
  
  // Application layer - Use cases with injected repositories
  const getDashboardReservationsUseCase = new GetDashboardReservationsUseCase(
    reservationRepository
  );
  
  // Domain layer - Services with injected use cases
  const reservationService = new DashboardReservationsService(
    getDashboardReservationsUseCase
  );

  return {
    reservationService,
  };
}

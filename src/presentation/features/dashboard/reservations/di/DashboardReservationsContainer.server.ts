import { GetDashboardReservationsUseCase } from '../application/GetDashboardReservationsUseCase';
import { DashboardReservationsService } from '../domain/DashboardReservationsService';
import { ReservationRepository } from '../infrastructure/ReservationRepository';
import { IReservationRepository } from '../domain/repositories/IReservationRepository';
import { GetSubScenarioStatsUseCase } from '@/application/sub-scenario/use-cases/GetSubScenarioStatsUseCase';
import { SubScenarioRepository } from '@/infrastructure/repositories/sub-scenario/sub-scenario-repository.adapter';
import { ISubScenarioRepository } from '@/entities/sub-scenario/infrastructure/ISubScenarioRepository';
import { GetUserStatsUseCase } from '@/application/user/use-cases/GetUserStatsUseCase';
import { UserRepositoryAdapter } from '@/infrastructure/repositories/user/user-repository.adapter';
import { IUserRepository } from '@/entities/user/infrastructure/IUserRepository';
import { ServerHttpClientFactory } from '@/shared/api/http-client-server';

export interface DashboardReservationsContainer {
  reservationService: DashboardReservationsService;
}

export function createDashboardReservationsContainer(): DashboardReservationsContainer {
  // DDD: Dependency injection - build complete container with repositories

  // Infrastructure layer - HTTP client for server-side operations
  const httpClient = ServerHttpClientFactory.createServerWithAuth();

  // Infrastructure layer - Repository implementations
  const reservationRepository: IReservationRepository = new ReservationRepository();
  const subScenarioRepository: ISubScenarioRepository = new SubScenarioRepository(httpClient);
  const userRepository: IUserRepository = new UserRepositoryAdapter(httpClient);

  // Application layer - Use cases with injected repositories
  const getSubScenarioStatsUseCase = new GetSubScenarioStatsUseCase(subScenarioRepository);
  const getUserStatsUseCase = new GetUserStatsUseCase(userRepository);
  const getDashboardReservationsUseCase = new GetDashboardReservationsUseCase(
    reservationRepository,
    getSubScenarioStatsUseCase,
    getUserStatsUseCase
  );

  // Domain layer - Services with injected use cases
  const reservationService = new DashboardReservationsService(
    getDashboardReservationsUseCase
  );

  return {
    reservationService,
  };
}

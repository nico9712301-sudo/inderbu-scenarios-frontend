import { IReservationRepository, ReservationFilters } from '../domain/repositories/IReservationRepository';
import { GetSubScenarioStatsUseCase } from '@/application/sub-scenario/use-cases/GetSubScenarioStatsUseCase';
import { GetUserStatsUseCase } from '@/application/user/use-cases/GetUserStatsUseCase';

export interface DashboardReservationsResponse {
  reservations: any[];
  stats: {
    total: number;
    today: number;
    approved: number;
    pending: number;
    rejected: number;
    activeScenarios: number;
    registeredClients: number;
  };
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export class GetDashboardReservationsUseCase {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly getSubScenarioStatsUseCase: GetSubScenarioStatsUseCase,
    private readonly getUserStatsUseCase: GetUserStatsUseCase
  ) {}

  async execute(filters: ReservationFilters = {}): Promise<DashboardReservationsResponse> {
    try {
      // Default filters
      const defaultFilters: ReservationFilters = {
        page: 1,
        limit: 7,
        ...filters,
      };

      console.log('🔍 Use case filters:', JSON.stringify(defaultFilters, null, 2));

      // Get paginated reservations with filters
      const paginatedResult = await this.reservationRepository.getAll(defaultFilters);

      // Get all reservations for stats calculation (without pagination)
      const allReservations = await this.reservationRepository.getAllSimple();
      console.log({allReservations});

      // Get active sub-scenarios stats
      const activeScenarioStats = await this.getSubScenarioStatsUseCase.execute({ active: true });

      // Get registered clients stats (roleId: 3, 4, 5 and isActive: true)
      const userStats = await this.getUserStatsUseCase.execute({ 
        roleId: [3, 4, 5], 
        isActive: true 
      });

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const stats = {
        total: allReservations.length,
        today: allReservations.filter(r => r.reservationDate === today).length,
        approved: allReservations.filter(r => r.reservationStateId === 2).length,
        pending: allReservations.filter(r => r.reservationStateId === 1).length,
        rejected: allReservations.filter(r => r.reservationStateId === 3).length,
        activeScenarios: activeScenarioStats.count,
        registeredClients: userStats.count,
      };

      return {
        reservations: paginatedResult.data,
        stats,
        meta: paginatedResult.meta,
      };

    } catch (error) {
      // Check if this is a post-logout error and handle gracefully
      if (this.isPostLogoutError(error)) {
        console.warn('Dashboard post-logout request detected - returning empty result');
        return this.getEmptyResponse();
      }

      console.error('Error in GetDashboardReservationsUseCase:', error);
      throw error;
    }
  }

  private isPostLogoutError(error: any): boolean {
    // Check for ApiHttpError with isPostLogout flag
    if (error && error.statusCode === 401 && error.isPostLogout) {
      return true;
    }

    // Check for error message indicating session ended
    if (error && error.message && error.message.includes('session ended')) {
      return true;
    }

    return false;
  }

  private getEmptyResponse(): DashboardReservationsResponse {
    return {
      reservations: [],
      stats: {
        total: 0,
        today: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        activeScenarios: 0,
        registeredClients: 0,
      },
      meta: {
        page: 1,
        limit: 7,
        totalItems: 0,
        totalPages: 0,
      },
    };
  }
}

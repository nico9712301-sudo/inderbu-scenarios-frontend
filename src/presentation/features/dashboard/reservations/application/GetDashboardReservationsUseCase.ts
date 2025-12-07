import { IReservationRepository, ReservationFilters } from '../domain/repositories/IReservationRepository';

export interface DashboardReservationsResponse {
  reservations: any[];
  stats: {
    total: number;
    today: number;
    approved: number;
    pending: number;
    rejected: number;
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
    private readonly reservationRepository: IReservationRepository
  ) {}

  async execute(filters: ReservationFilters = {}): Promise<DashboardReservationsResponse> {
    try {
      // Default filters
      const defaultFilters: ReservationFilters = {
        page: 1,
        limit: 7,
        ...filters,
      };

      // Get paginated reservations with filters
      const paginatedResult = await this.reservationRepository.getAll(defaultFilters);

      // Get all reservations for stats calculation (without pagination)
      const allReservations = await this.reservationRepository.getAllSimple();
      console.log({allReservations});


      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const stats = {
        total: allReservations.length,
        today: allReservations.filter(r => r.reservationDate === today).length,
        approved: allReservations.filter(r => r.reservationStateId === 2).length,
        pending: allReservations.filter(r => r.reservationStateId === 1).length,
        rejected: allReservations.filter(r => r.reservationStateId === 3).length,
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

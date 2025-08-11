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
      const paginatedResult = await this.reservationRepository.getAllWithPagination(defaultFilters);

      // Get all reservations for stats calculation (without pagination)
      const allReservations = await this.reservationRepository.getAll();

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
      console.error('Error in GetDashboardReservationsUseCase:', error);
      throw error;
    }
  }
}

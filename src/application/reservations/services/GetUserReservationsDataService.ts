import { IReservationRepository } from '@/entities/reservation/infrastructure/IReservationRepository';
import { ReservationEntity } from '@/entities/reservation/domain/ReservationEntity';
import { PageMetaDto } from '@/shared/api';

export interface IUserReservationsDataResponse {
  reservations: ReservationEntity[];     // Domain entities
  meta: PageMetaDto;                        // Pagination metadata
  metadata: {
    userId: number;
    accessedAt: Date;
    accessedBy: string;
    accessLevel: string;
  };
}

/**
 * User Reservations Data Application Service
 * 
 * Application service that coordinates user reservation operations.
 * Uses the new DDD repository pattern with domain entities.
 */
export class GetUserReservationsDataService {
  constructor(
    private readonly reservationRepository: IReservationRepository
  ) {}

  async execute(userId: number): Promise<IUserReservationsDataResponse> {
    try {
      // Business validation
      if (userId <= 0) {
        throw new Error('Invalid user ID');
      }

      // Get user reservations using repository
      const reservationsResult = await this.reservationRepository.getByUserId(userId, {
        page: 1,
        limit: 6
      });

      // Return response with domain entities
      return {
        reservations: reservationsResult.data,     // ReservationEntity[]
        meta: reservationsResult.meta,             // PageMeta
        metadata: {
          userId,
          accessedAt: new Date(),
          accessedBy: 'system', // TODO: Get from auth context
          accessLevel: 'user'
        }
      };

    } catch (error) {
      console.error('Error in GetUserReservationsDataService:', error);
      throw error;
    }
  }
}
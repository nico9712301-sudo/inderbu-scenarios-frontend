import { GetUserReservationsDataService, IUserReservationsDataResponse } from '../services/GetUserReservationsDataService';

// Re-export the interface for external usage
export type { IUserReservationsDataResponse };

/**
 * Get User Reservations Use Case
 * 
 * Simplified use case that delegates to the application service.
 * Maintains the use case pattern while leveraging the existing service logic.
 * This approach allows for future business logic specific to user reservations.
 */
export class GetUserReservationsUseCase {
  constructor(
    private readonly getUserReservationsDataService: GetUserReservationsDataService
  ) {}

  async execute(userId: number): Promise<IUserReservationsDataResponse> {
    try {
      // User-specific business validation could go here
      if (userId <= 0) {
        throw new Error('Invalid user ID');
      }

      // Delegate to the application service
      return await this.getUserReservationsDataService.execute(userId);

    } catch (error) {
      console.error('Error in GetUserReservationsUseCase:', error);
      throw error;
    }
  }
}
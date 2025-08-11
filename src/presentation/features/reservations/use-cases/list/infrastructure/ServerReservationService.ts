import { UserAccessPolicy } from '@/entities/user/domain/user-access.policy';
import { 
  GetUserReservationsUseCase, 
  GetUserReservationsRequest,
  GetUserReservationsResponse 
} from '../application/GetUserReservationsUseCase';

// DDD: Infrastructure Service (adapts use case for external consumption)
export class ServerReservationService {
  constructor(
    private readonly useCase: GetUserReservationsUseCase
  ) {}

  /**
   * Server-side entry point for getting user reservations
   * Handles input validation and delegates to use case
   */
  async getUserReservations(
    targetUserId: string,
    requestingUserId?: number
  ): Promise<GetUserReservationsResponse> {
    
    // Infrastructure concern: Input validation
    const validUserId = UserAccessPolicy.validateUserId(targetUserId);
    
    // Execute use case - it will handle user lookup and authorization
    const request: GetUserReservationsRequest = {
      targetUserId: validUserId,
      requestingUser: null, // Use case will look up current user if needed
      pagination: { page: 1, limit: 6 }
    };

    return this.useCase.execute(request);
  }
}

// Factory for dependency injection
export function createServerReservationService(
  useCase: GetUserReservationsUseCase
): ServerReservationService {
  return new ServerReservationService(useCase);
}

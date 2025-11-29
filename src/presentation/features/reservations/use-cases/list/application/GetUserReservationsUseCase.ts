import { UserRepository } from '@/infrastructure/repositories/auth/auth-user-repository.adapter'; // Use existing
import { ReservationRepository } from '@/entities/reservation/infrastructure/reservation-repository.adapter'; // Use existing  
import { EventBus, ReservationsAccessedEvent } from '@/entities/reservation/domain/reservation.domain';
import { PaginatedReservations, GetReservationsQuery } from '@/entities/reservation/model/types';
import { UserAccessPolicy, AccessDeniedError } from '@/entities/user/domain/user-access.policy';
import { User } from '@/entities/user/model/types';

// DDD: Use Case Input DTOs
export interface GetUserReservationsRequest {
  targetUserId: number;
  requestingUser?: User | null;
  pagination?: {
    page?: number;
    limit?: number;
  };
}

// DDD: Use Case Output DTOs  
export interface GetUserReservationsResponse {
  reservations: PaginatedReservations;
  metadata: {
    userId: number;
    accessedAt: Date;
    accessedBy: string;
    accessLevel: string;
  };
}

// DDD: Application Service (Use Case)
export class GetUserReservationsUseCase {
  constructor(
    private readonly reservationRepo: ReservationRepository,
    private readonly userRepo: UserRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(request: GetUserReservationsRequest): Promise<GetUserReservationsResponse> {
    const { targetUserId, requestingUser, pagination = { page: 1, limit: 6 } } = request;

    // Get current user context if not provided
    let currentUser = requestingUser;
    if (!currentUser) {
      try {
        // Use existing getCurrentUser method from API repository
        currentUser = await this.userRepo.getCurrentUser();
        
        // Check if current user matches target user
        if (currentUser.id !== targetUserId) {
          currentUser = null; // Current user is not the target user
        }
      } catch (error) {
        // If we can't get current user (not authenticated), assume no access
        console.warn('Could not determine current user context:', error);
        currentUser = null;
      }
    }

    // Business rule: Access control validation
    if (!UserAccessPolicy.canAccessReservations(currentUser, targetUserId)) {
      throw new AccessDeniedError(
        `No tienes permisos para ver las reservas del usuario ${targetUserId}`
      );
    }

    // Business operation: Fetch reservations
    const query: GetReservationsQuery = {
      page: pagination.page || 1,
      limit: pagination.limit || 6
    };
    const reservations = await this.reservationRepo.getByUserId(targetUserId, query);

    // Domain event: Record access for audit trail
    await this.eventBus.publish(new ReservationsAccessedEvent(
      targetUserId,
      currentUser?.id || 0,
      reservations.data.length
    ));

    // Response with metadata
    return {
      reservations,
      metadata: {
        userId: targetUserId,
        accessedAt: new Date(),
        accessedBy: currentUser?.email || 'anonymous',
        accessLevel: UserAccessPolicy.getAccessLevel(currentUser)
      }
    };
  }
}

// DDD: Use Case factory for dependency injection
export function createGetUserReservationsUseCase(
  reservationRepo: ReservationRepository,
  userRepo: UserRepository,
  eventBus: EventBus
): GetUserReservationsUseCase {
  return new GetUserReservationsUseCase(reservationRepo, userRepo, eventBus);
}

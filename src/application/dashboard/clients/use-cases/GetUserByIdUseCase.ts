import { IUserRepository } from '@/entities/user/infrastructure/IUserRepository';
import { UserEntity } from '@/entities/user/domain/UserEntity';

/**
 * Get User By ID Use Case
 * 
 * Single-domain use case that retrieves a specific user by their ID.
 * Includes business validation and error handling.
 */
export class GetUserByIdUseCase {
  constructor(
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * Execute use case - get user by ID
   */
  async execute(id: number): Promise<UserEntity> {
    try {
      // Business validation
      if (!id || id <= 0) {
        throw new Error('User ID must be a positive number');
      }

      // Delegate to repository
      const user = await this.userRepository.getById(id);
      
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }

      // Additional business rules if needed
      // For example, check if user is active for certain operations
      
      return user;

    } catch (error) {
      console.error(`Error in GetUserByIdUseCase for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Execute use case with access control validation
   */
  async executeWithPermissionCheck(id: number, requestorUserId: number): Promise<UserEntity> {
    try {
      // Business validation
      if (!id || id <= 0) {
        throw new Error('User ID must be a positive number');
      }

      if (!requestorUserId || requestorUserId <= 0) {
        throw new Error('Requestor user ID must be a positive number');
      }

      // Get the user
      const user = await this.execute(id);

      // Business rule: Users can always view their own data
      if (user.id === requestorUserId) {
        return user;
      }

      // TODO: Add role-based permission checks here if needed
      // For now, allow all authenticated users to view other user details
      // In production, you might want to check if requestor has admin role

      return user;

    } catch (error) {
      console.error(`Error in GetUserByIdUseCase.executeWithPermissionCheck for ID ${id}:`, error);
      throw error;
    }
  }
}
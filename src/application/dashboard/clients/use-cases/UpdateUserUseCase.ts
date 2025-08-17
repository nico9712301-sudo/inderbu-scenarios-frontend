// Application Layer: Update User Use Case
// Single-domain business operation for updating users

import { IUserRepository, UpdateUserDto } from '@/entities/user/infrastructure/IUserRepository';
import { UserEntity } from '@/entities/user/domain/UserEntity';

/**
 * Update User Use Case
 * 
 * Handles user profile updates including:
 * - Personal information (name, email, phone)
 * - Contact details (address)
 * - System settings (role, neighborhood, active status)
 * - Business validation and error handling
 */
export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: number, updateData: UpdateUserDto): Promise<UserEntity> {
    // Business validation
    if (id <= 0) {
      throw new Error('User ID must be a positive number');
    }

    // Validate email format if provided
    if (updateData.email && !updateData.email.includes('@')) {
      throw new Error('Invalid email format');
    }

    // Validate DNI if provided
    if (updateData.dni !== undefined && updateData.dni <= 0) {
      throw new Error('DNI must be a positive number');
    }

    // Validate names if provided
    if (updateData.firstName !== undefined && updateData.firstName.trim().length < 2) {
      throw new Error('First name must be at least 2 characters');
    }

    if (updateData.lastName !== undefined && updateData.lastName.trim().length < 2) {
      throw new Error('Last name must be at least 2 characters');
    }

    // Validate phone if provided
    if (updateData.phone !== undefined && updateData.phone.trim().length < 8) {
      throw new Error('Phone number must be at least 8 characters');
    }

    // Validate role ID if provided
    if (updateData.roleId !== undefined && updateData.roleId <= 0) {
      throw new Error('Role ID must be a positive number');
    }

    // Validate neighborhood ID if provided
    if (updateData.neighborhoodId !== undefined && updateData.neighborhoodId <= 0) {
      throw new Error('Neighborhood ID must be a positive number');
    }

    try {
      // Execute update through repository
      const updatedUser = await this.userRepository.update(id, updateData);
      
      console.log(`User ${id} updated successfully`);
      return updatedUser;
    } catch (error) {
      // Handle repository errors
      if (error instanceof Error) {
        throw new Error(`Failed to update user: ${error.message}`);
      }
      throw new Error('Unknown error occurred while updating user');
    }
  }
}
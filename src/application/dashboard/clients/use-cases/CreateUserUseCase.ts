// Application Layer: Create User Use Case
// Single-domain business operation for creating users

import { IUserRepository, CreateUserDto } from '@/entities/user/infrastructure/IUserRepository';
import { UserEntity } from '@/entities/user/domain/UserEntity';
import { UserBackend, UserTransformer } from '@/infrastructure/transformers/UserTransformer';

/**
 * Create User Use Case
 * 
 * Handles new user creation including:
 * - Input validation and business rules
 * - Email uniqueness verification
 * - User data persistence
 * - Error handling and reporting
 */
export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userData: CreateUserDto): Promise<Partial<UserBackend>> {
    // Data preparation
    const userToCreate: CreateUserDto = {
      ...userData,
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      email: userData.email.toLowerCase().trim(),
      phone: userData.phone.trim(),
      address: userData.address.trim(),
    };

    try {
      // Execute creation through repository
      const createdUser: UserEntity = await this.userRepository.create(userToCreate);
      
      return UserTransformer.toBackend(createdUser);
    } catch (error) {
      // Handle repository errors
      if (error instanceof Error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }
      throw new Error('Unknown error occurred while creating user');
    }
  }
}
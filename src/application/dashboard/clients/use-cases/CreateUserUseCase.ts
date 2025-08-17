// Application Layer: Create User Use Case
// Single-domain business operation for creating users

import { IUserRepository, CreateUserDto } from '@/entities/user/infrastructure/IUserRepository';
import { UserEntity } from '@/entities/user/domain/UserEntity';

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

  async execute(userData: CreateUserDto): Promise<UserEntity> {
    // Business validation - Required fields
    if (!userData.dni) {
      throw new Error('DNI is required');
    }

    if (!userData.firstName || userData.firstName.trim().length < 2) {
      throw new Error('First name is required and must be at least 2 characters');
    }

    if (!userData.lastName || userData.lastName.trim().length < 2) {
      throw new Error('Last name is required and must be at least 2 characters');
    }

    if (!userData.email || !userData.email.includes('@')) {
      throw new Error('Valid email is required');
    }

    if (!userData.phone || userData.phone.trim().length < 8) {
      throw new Error('Phone number is required and must be at least 8 characters');
    }

    if (!userData.address || userData.address.trim().length < 5) {
      throw new Error('Address is required and must be at least 5 characters');
    }

    // Business validation - Numeric fields
    if (userData.dni <= 0) {
      throw new Error('DNI must be a positive number');
    }

    if (userData.roleId <= 0) {
      throw new Error('Valid role is required');
    }

    if (userData.neighborhoodId <= 0) {
      throw new Error('Valid neighborhood is required');
    }

    // Business rule: Check email uniqueness
    try {
      const emailExists = await this.userRepository.emailExists(userData.email);
      if (emailExists) {
        throw new Error('Email address is already registered');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('already registered')) {
        throw error; // Re-throw email uniqueness error
      }
      // Log but don't fail for email check errors
      console.warn('Could not verify email uniqueness:', error);
    }

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
      const createdUser = await this.userRepository.create(userToCreate);
      
      console.log(`User created successfully with ID: ${createdUser.id}`);
      return createdUser;
    } catch (error) {
      // Handle repository errors
      if (error instanceof Error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }
      throw new Error('Unknown error occurred while creating user');
    }
  }
}
// Application Layer: Update User Use Case
// Single-domain business operation for updating users

import {
  IUserRepository,
  UpdateUserDto,
} from "@/entities/user/infrastructure/IUserRepository";
import { UserEntity } from "@/entities/user/domain/UserEntity";
import { UserBackend, UserTransformer } from "@/infrastructure/transformers/UserTransformer";

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

  async execute(id: number, updateData: UpdateUserDto): Promise<Partial<UserBackend>> {
    try {
      // Execute update through repository
      // TODO: This is wrong, we need to send the correct information from the UI
      const updatedUser: UserEntity = await this.userRepository.update(id, {
        dni: updateData.dni,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        phone: updateData.phone,
        roleId: updateData.roleId,
        address: updateData.address,
        neighborhoodId: updateData.neighborhoodId,
        active: updateData.active, // Ensure active status is updated
      });

      console.log(`User ${id} updated successfully`, updatedUser);
      return UserTransformer.toBackend(updatedUser);
    } catch (error) {
      // Handle repository errors
      if (error instanceof Error) {
        throw new Error(`Failed to update user: ${error.message}`);
      }
      throw new Error("Unknown error occurred while updating user");
    }
  }
}

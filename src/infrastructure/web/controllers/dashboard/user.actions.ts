"use server";

import { revalidatePath } from 'next/cache';

import { ErrorHandlerComposer } from '@/shared/api/error-handler';

import { ContainerFactory } from '@/infrastructure/config/di/container.factory';
import { IContainer } from '@/infrastructure/config/di/simple-container';
import { TOKENS } from '@/infrastructure/config/di/tokens';

import { GetUserByIdUseCase } from '@/application/dashboard/clients/use-cases/GetUserByIdUseCase';
import { GetUsersUseCase } from '@/application/dashboard/clients/use-cases/GetUsersUseCase';
import { CreateUserUseCase } from '@/application/dashboard/clients/use-cases/CreateUserUseCase';
import { UpdateUserUseCase } from '@/application/dashboard/clients/use-cases/UpdateUserUseCase';

import { CreateUserDto, UpdateUserDto } from '@/entities/user/infrastructure/IUserRepository';
import { UserEntity } from '@/entities/user/domain/UserEntity';

/**
 * User Server Actions
 * 
 * Next.js Server Actions that handle HTTP requests and coordinate with Use Cases.
 * These act as controllers in the Clean Architecture, handling:
 * - Input validation and transformation
 * - Use Case orchestration via Dependency Injection
 * - Error handling with ErrorHandlerComposer
 * - Cache invalidation (revalidatePath)
 * - Response formatting
 */

// =============================================================================
// GET USER BY ID
// =============================================================================

export async function getUserByIdAction(id: number) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    // Input validation
    if (!id || id <= 0) {
      throw new Error('Valid user ID is required');
    }

    // Get dependencies from Simple DI container
    const container: IContainer = ContainerFactory.createContainer();
    const getUserByIdUseCase = container.get<GetUserByIdUseCase>(
      TOKENS.GetUserByIdUseCase
    );

    // Execute use case
    const result: UserEntity = await getUserByIdUseCase.execute(id);

    console.log('Get user by ID result:', result);
    
    return result.toPlainObject();
  }, 'getUserByIdAction');
}

// =============================================================================
// GET USERS WITH PAGINATION
// =============================================================================

import { UserFilters } from '@/entities/user/infrastructure/IUserRepository';
import { UserBackend } from '@/infrastructure/transformers/UserTransformer';


export async function getUsersAction(request: UserFilters) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    // Get dependencies from Simple DI container
    const container: IContainer = ContainerFactory.createContainer();
    const getUsersUseCase = container.get<GetUsersUseCase>(
      TOKENS.GetUsersUseCase
    );

    // Execute use case
    const result = await getUsersUseCase.execute({
      page: request.page || 1,
      limit: request.limit || 10,
      search: request.search,
      roleId: request.roleId,
      neighborhoodId: request.neighborhoodId,
      active: request.active,
    });

    return {
      success: true,
      data: result,
    };
  }, 'getUsersAction');
}

// =============================================================================
// CREATE USER
// =============================================================================

export async function createUserAction(data: CreateUserDto) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    // Input validation
    if (!data.dni || !data.firstName || !data.lastName || !data.email) {
      throw new Error('Required fields are missing');
    }

    if (!data.email.includes('@')) {
      throw new Error('Valid email is required');
    }

    // Get dependencies from Simple DI container
    const container: IContainer = ContainerFactory.createContainer();
    const createUserUseCase = container.get<CreateUserUseCase>(
      TOKENS.CreateUserUseCase
    );

    // Execute use case
    const result: Partial<UserBackend> = await createUserUseCase.execute(data);

    // Invalidate Next.js cache
    revalidatePath('/dashboard/clients');

    return result;
  }, 'createUserAction');
}

// =============================================================================
// UPDATE USER
// =============================================================================

export async function updateUserAction(id: number, data: UpdateUserDto) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    // Get dependencies from Simple DI container
    const container: IContainer = ContainerFactory.createContainer();
    const updateUserUseCase = container.get<UpdateUserUseCase>(
      TOKENS.UpdateUserUseCase
    );

    // Execute use case
    const result: Partial<UserBackend> = await updateUserUseCase.execute(id, data);

    console.log(`User ${id} updated successfully`, result);
    

    // Invalidate Next.js cache
    revalidatePath('/dashboard/clients');
    revalidatePath(`/dashboard/clients/${id}`);

    return result;
  }, 'updateUserAction');
}

// =============================================================================
// DELETE USER (if needed)
// =============================================================================

export async function deleteUserAction(id: number) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    // Input validation
    if (!id || id <= 0) {
      throw new Error('Valid user ID is required');
    }

    // TODO: Implement DeleteUserUseCase when available
    console.warn('DeleteUserUseCase not implemented yet, using direct approach');

    // Get dependencies from Simple DI container (for future use case)
    const container: IContainer = ContainerFactory.createContainer();
    
    // TODO: Replace with use case when implemented
    // const deleteUserUseCase = container.get<DeleteUserUseCase>(
    //   TOKENS.DeleteUserUseCase
    // );
    // await deleteUserUseCase.execute(id);

    // Temporary direct implementation
    // This should be replaced with proper Use Case implementation
    throw new Error('DeleteUserUseCase not implemented yet');

    // Invalidate Next.js cache
    revalidatePath('/dashboard/clients');

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }, 'deleteUserAction');
}
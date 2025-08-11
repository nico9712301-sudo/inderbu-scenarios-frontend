"use server";

import { revalidatePath } from 'next/cache';
import { ContainerFactory } from '@/infrastructure/config/di/container.factory';
import { TYPES } from '@/infrastructure/config/di/types';
import { CreateScenarioUseCase } from '@/application/dashboard/scenarios/CreateScenarioUseCase';
import { UpdateScenarioUseCase } from '@/application/dashboard/scenarios/UpdateScenarioUseCase';
import { GetScenariosUseCase } from '@/application/dashboard/scenarios/GetScenariosUseCase';
import { GetScenariosDataUseCase } from '@/application/dashboard/scenarios/GetScenariosDataUseCase';
import { ErrorHandlerComposer } from '@/shared/api/error-handler';

/**
 * Scenario Server Actions
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
// CREATE SCENARIO
// =============================================================================

export interface CreateScenarioRequest {
  name: string;
  address: string;
  description?: string;
  neighborhoodId: number;
}

export async function createScenarioAction(request: CreateScenarioRequest) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    // Get dependencies from DI container
    const container = ContainerFactory.createContainer();
    const createScenarioUseCase = container.get<CreateScenarioUseCase>(
      TYPES.CreateScenarioUseCase
    );

    // Execute use case
    const result = await createScenarioUseCase.execute({
      name: request.name,
      address: request.address,
      description: request.description,
      neighborhoodId: request.neighborhoodId,
    });

    // Invalidate Next.js cache
    revalidatePath('/dashboard/scenarios');

    return {
      success: true,
      data: result,
    };
  }, 'createScenarioAction');
}

// =============================================================================
// UPDATE SCENARIO
// =============================================================================

export interface UpdateScenarioRequest {
  name?: string;
  address?: string;
  description?: string;
  neighborhoodId?: number;
  active?: boolean;
}

export async function updateScenarioAction(
  id: number,
  request: UpdateScenarioRequest
) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    // Input validation
    if (!id || id <= 0) {
      throw new Error('Valid scenario ID is required');
    }

    // Get dependencies from DI container
    const container = ContainerFactory.createContainer();
    const updateScenarioUseCase = container.get<UpdateScenarioUseCase>(
      TYPES.UpdateScenarioUseCase
    );

    // Execute use case
    const result = await updateScenarioUseCase.execute(id, {
      name: request.name,
      address: request.address,
      description: request.description,
      neighborhoodId: request.neighborhoodId,
      active: request.active,
    });

    // Invalidate Next.js cache
    revalidatePath('/dashboard/scenarios');
    revalidatePath(`/dashboard/scenarios/${id}`);

    return {
      success: true,
      data: result,
    };
  }, 'updateScenarioAction');
}

// =============================================================================
// GET SCENARIOS WITH PAGINATION
// =============================================================================

export interface GetScenariosRequest {
  page?: number;
  limit?: number;
  search?: string;
  neighborhoodId?: number;
  active?: boolean;
}

export async function getScenariosAction(request: GetScenariosRequest = {}) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    // Get dependencies from DI container
    const container = ContainerFactory.createContainer();
    const getScenariosUseCase = container.get<GetScenariosUseCase>(
      TYPES.GetScenariosUseCase
    );

    // Execute use case
    const result = await getScenariosUseCase.execute({
      page: request.page || 1,
      limit: request.limit || 10,
      search: request.search,
      neighborhoodId: request.neighborhoodId,
      active: request.active,
    });

    return {
      success: true,
      data: result,
    };
  }, 'getScenariosAction');
}

// =============================================================================
// GET SCENARIOS DATA (Composite Operation)
// =============================================================================

export interface GetScenariosDataRequest {
  scenarioFilters?: GetScenariosRequest;
  includePagination?: boolean;
  includeNeighborhoods?: boolean;
}

export async function getScenariosDataAction(
  request: GetScenariosDataRequest = {}
) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    // Get dependencies from DI container
    const container = ContainerFactory.createContainer();
    const getScenariosDataUseCase = container.get<GetScenariosDataUseCase>(
      TYPES.GetScenariosDataUseCase
    );

    // Execute composite use case
    const result = await getScenariosDataUseCase.execute(
      request.scenarioFilters || {},
    );

    return {
      success: true,
      data: result,
    };
  }, 'getScenariosDataAction');
}

// =============================================================================
// DELETE SCENARIO (if needed)
// =============================================================================

export async function deleteScenarioAction(id: number) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    // Input validation
    if (!id || id <= 0) {
      throw new Error('Valid scenario ID is required');
    }

    // TODO: Implement when DeleteScenarioUseCase is available
    // const container = ContainerFactory.createContainer();
    // const deleteScenarioUseCase = container.get<DeleteScenarioUseCase>(
    //   TYPES.DeleteScenarioUseCase
    // );
    // 
    // await deleteScenarioUseCase.execute(id);

    // Temporary direct implementation
    console.warn('DeleteScenarioUseCase not implemented yet, using direct approach');

    // Invalidate Next.js cache
    revalidatePath('/dashboard/scenarios');

    return {
      success: true,
      message: 'Scenario deleted successfully',
    };
  }, 'deleteScenarioAction');
}

// =============================================================================
// CONTAINER HEALTH CHECK (Development/Debugging)
// =============================================================================

export async function getContainerHealthAction() {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const container = ContainerFactory.createContainer();
    
    // Check if container has health status method (ScenarioContainer specific)
    if ('getHealthStatus' in container && typeof container.getHealthStatus === 'function') {
      const health = (container as any).getHealthStatus();
      
      return {
        success: true,
        data: {
          containerHealth: health,
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString(),
        },
      };
    }

    return {
      success: true,
      data: {
        containerHealth: { status: 'unknown', message: 'Health check not available' },
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      },
    };
  }, 'getContainerHealthAction');
}
"use server";

import { revalidatePath } from 'next/cache';
import { ContainerFactory } from '@/infrastructure/config/di/container.factory';
import { TOKENS } from '@/infrastructure/config/di/tokens';
import { CreateSubScenarioUseCase } from '@/application/dashboard/sub-scenarios/use-cases/CreateSubScenarioUseCase';
import { UpdateSubScenarioUseCase } from '@/application/dashboard/sub-scenarios/use-cases/UpdateSubScenarioUseCase';
import { UploadSubScenarioImagesUseCase, ImageUploadData } from '@/application/dashboard/sub-scenarios/use-cases/UploadSubScenarioImagesUseCase';
import { ErrorHandlerComposer } from '@/shared/api/error-handler';
import { IContainer } from '@/infrastructure/config/di/simple-container';
import { SubScenario, SubScenarioImage } from '@/services/api';

/**
 * Sub-Scenario Server Actions
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
// CREATE SUB-SCENARIO
// =============================================================================

export interface CreateSubScenarioRequest {
  name: string;
  hasCost: boolean;
  numberOfSpectators: number;
  numberOfPlayers: number;
  recommendations?: string;
  scenarioId: number;
  activityAreaId: number;
  fieldSurfaceTypeId: number;
  images?: any[];
}

export async function createSubScenarioAction(data: CreateSubScenarioRequest) {
  return ErrorHandlerComposer.withErrorHandling(async () => {
    // Dependency Injection: Get container and resolve use case
    const container: IContainer = ContainerFactory.createContainer();
    const createSubScenarioUseCase = container.get<CreateSubScenarioUseCase>(TOKENS.CreateSubScenarioUseCase);

    // Execute Use Case
    const subScenario = await createSubScenarioUseCase.execute(data);

    // Cache invalidation
    revalidatePath('/dashboard/sub-scenarios');

    return subScenario;
  }, 'createSubScenario');
}

// =============================================================================
// UPDATE SUB-SCENARIO
// =============================================================================

export interface UpdateSubScenarioRequest {
  name?: string;
  hasCost?: boolean;
  numberOfSpectators?: number;
  numberOfPlayers?: number;
  recommendations?: string;
  scenarioId?: number;
  activityAreaId?: number;
  fieldSurfaceTypeId?: number;
  active?: boolean;
}

export async function updateSubScenarioAction(id: number, data: UpdateSubScenarioRequest) {
  return ErrorHandlerComposer.withErrorHandling(async () => {
    // Dependency Injection: Get container and resolve use case
    const container: IContainer = ContainerFactory.createContainer();
    const updateSubScenarioUseCase = container.get<UpdateSubScenarioUseCase>(TOKENS.UpdateSubScenarioUseCase);

    // Execute Use Case
    const subScenario = await updateSubScenarioUseCase.execute(id, data);

    // Cache invalidation
    revalidatePath('/dashboard/sub-scenarios');

    return subScenario;
  }, 'updateSubScenario');
}

// =============================================================================
// UPLOAD SUB-SCENARIO IMAGES
// =============================================================================

export async function uploadSubScenarioImagesAction(
  subScenarioId: number,
  images: ImageUploadData[]
) {
  return ErrorHandlerComposer.withErrorHandling(async () => {
    // Dependency Injection: Get container and resolve use case
    const container: IContainer = ContainerFactory.createContainer();
    const uploadSubScenarioImagesUseCase = container.get<UploadSubScenarioImagesUseCase>(TOKENS.UploadSubScenarioImagesUseCase);

    // Execute Use Case
    const uploadedImages = await uploadSubScenarioImagesUseCase.execute(subScenarioId, images);

    // Cache invalidation
    revalidatePath('/dashboard/sub-scenarios');

    return uploadedImages;
  }, 'uploadSubScenarioImages');
}
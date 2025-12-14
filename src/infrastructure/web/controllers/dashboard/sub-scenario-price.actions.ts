"use server";

import { revalidatePath } from 'next/cache';
import { ErrorHandlerComposer } from '@/shared/api/error-handler';
import { ContainerFactory } from '@/infrastructure/config/di/container.factory';
import { IContainer } from '@/infrastructure/config/di/simple-container';
import { TOKENS } from '@/infrastructure/config/di/tokens';
import { CreateSubScenarioPriceUseCase } from '@/application/dashboard/billing/use-cases/CreateSubScenarioPriceUseCase';
import { UpdateSubScenarioPriceUseCase } from '@/application/dashboard/billing/use-cases/UpdateSubScenarioPriceUseCase';
import { GetSubScenarioPriceUseCase } from '@/application/dashboard/billing/use-cases/GetSubScenarioPriceUseCase';
import { DeleteSubScenarioPriceUseCase } from '@/application/dashboard/billing/use-cases/DeleteSubScenarioPriceUseCase';
import { 
  SubScenarioPriceEntity, 
  CreateSubScenarioPriceData, 
  UpdateSubScenarioPriceData 
} from '@/entities/billing/domain/SubScenarioPriceEntity';

/**
 * Sub-Scenario Price Server Actions
 */

// =============================================================================
// CREATE SUB-SCENARIO PRICE
// =============================================================================

export async function createSubScenarioPriceAction(data: CreateSubScenarioPriceData) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const container: IContainer = ContainerFactory.createContainer();
    const createPriceUseCase = container.get<CreateSubScenarioPriceUseCase>(
      TOKENS.CreateSubScenarioPriceUseCase
    );

    const result: SubScenarioPriceEntity = await createPriceUseCase.execute(data);

    revalidatePath('/dashboard/sub-scenarios');

    return result;
  }, 'createSubScenarioPriceAction');
}

// =============================================================================
// UPDATE SUB-SCENARIO PRICE
// =============================================================================

export async function updateSubScenarioPriceAction(
  subScenarioId: number,
  data: UpdateSubScenarioPriceData
) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const container: IContainer = ContainerFactory.createContainer();
    const updatePriceUseCase = container.get<UpdateSubScenarioPriceUseCase>(
      TOKENS.UpdateSubScenarioPriceUseCase
    );

    const result: SubScenarioPriceEntity = await updatePriceUseCase.execute(
      subScenarioId,
      data
    );

    revalidatePath('/dashboard/sub-scenarios');

    return result;
  }, 'updateSubScenarioPriceAction');
}

// =============================================================================
// GET SUB-SCENARIO PRICE
// =============================================================================

export async function getSubScenarioPriceAction(subScenarioId: number) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const container: IContainer = ContainerFactory.createContainer();
    const getPriceUseCase = container.get<GetSubScenarioPriceUseCase>(
      TOKENS.GetSubScenarioPriceUseCase
    );

    const result = await getPriceUseCase.execute(subScenarioId);

    return result ? result : null;
  }, 'getSubScenarioPriceAction');
}

// =============================================================================
// DELETE SUB-SCENARIO PRICE
// =============================================================================

export async function deleteSubScenarioPriceAction(subScenarioId: number) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const container: IContainer = ContainerFactory.createContainer();
    const deletePriceUseCase = container.get<DeleteSubScenarioPriceUseCase>(
      TOKENS.DeleteSubScenarioPriceUseCase
    );

    await deletePriceUseCase.execute(subScenarioId);

    revalidatePath('/dashboard/sub-scenarios');

    return { success: true };
  }, 'deleteSubScenarioPriceAction');
}

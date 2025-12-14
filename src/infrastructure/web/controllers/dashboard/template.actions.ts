"use server";

import { revalidatePath } from 'next/cache';
import { ErrorHandlerComposer } from '@/shared/api/error-handler';
import { ContainerFactory } from '@/infrastructure/config/di/container.factory';
import { IContainer } from '@/infrastructure/config/di/simple-container';
import { TOKENS } from '@/infrastructure/config/di/tokens';
import type { ITemplateRepository } from '@/entities/billing/infrastructure/ITemplateRepository';
import type { CreateTemplateData, UpdateTemplateData, TemplateEntity } from '@/entities/billing/domain/TemplateEntity';

/**
 * Template Server Actions
 * 
 * Next.js Server Actions for handling receipt templates.
 */

// =============================================================================
// CREATE TEMPLATE
// =============================================================================

export async function createTemplateAction(data: CreateTemplateData) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const container: IContainer = ContainerFactory.createContainer();
    const templateRepository = container.get<ITemplateRepository>(
      TOKENS.ITemplateRepository
    );

    const result = await templateRepository.create(data);

    revalidatePath('/dashboard/options?tab=templates');
    revalidatePath('/dashboard/reservations');

    return result.toPlainObject();
  }, 'createTemplateAction');
}

// =============================================================================
// UPDATE TEMPLATE
// =============================================================================

export async function updateTemplateAction(id: number, data: UpdateTemplateData) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const container: IContainer = ContainerFactory.createContainer();
    const templateRepository = container.get<ITemplateRepository>(
      TOKENS.ITemplateRepository
    );

    const result = await templateRepository.update(id, data);

    revalidatePath('/dashboard/options?tab=templates');
    revalidatePath('/dashboard/reservations');

    return result.toPlainObject();
  }, 'updateTemplateAction');
}

// =============================================================================
// GET TEMPLATE BY ID
// =============================================================================

export async function getTemplateByIdAction(id: number) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const container: IContainer = ContainerFactory.createContainer();
    const templateRepository = container.get<ITemplateRepository>(
      TOKENS.ITemplateRepository
    );

    const result = await templateRepository.getById(id);

    return result ? result.toPlainObject() : null;
  }, 'getTemplateByIdAction');
}

// =============================================================================
// DELETE TEMPLATE
// =============================================================================

export async function deleteTemplateAction(id: number) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const container: IContainer = ContainerFactory.createContainer();
    const templateRepository = container.get<ITemplateRepository>(
      TOKENS.ITemplateRepository
    );

    await templateRepository.delete(id);

    revalidatePath('/dashboard/options?tab=templates');
    revalidatePath('/dashboard/reservations');

    return { success: true };
  }, 'deleteTemplateAction');
}

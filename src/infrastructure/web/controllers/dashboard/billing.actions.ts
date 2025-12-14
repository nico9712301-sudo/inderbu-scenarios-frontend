"use server";

import { revalidatePath } from 'next/cache';
import { ErrorHandlerComposer } from '@/shared/api/error-handler';
import { ContainerFactory } from '@/infrastructure/config/di/container.factory';
import { IContainer } from '@/infrastructure/config/di/simple-container';
import { TOKENS } from '@/infrastructure/config/di/tokens';
import { GenerateReceiptUseCase } from '@/application/dashboard/billing/use-cases/GenerateReceiptUseCase';
import { SendReceiptByEmailUseCase } from '@/application/dashboard/billing/use-cases/SendReceiptByEmailUseCase';
import { GetReceiptsByReservationUseCase } from '@/application/dashboard/billing/use-cases/GetReceiptsByReservationUseCase';
import { GetReceiptTemplatesUseCase } from '@/application/dashboard/billing/use-cases/GetReceiptTemplatesUseCase';
import { ReceiptEntity, GenerateReceiptData, SendReceiptData } from '@/entities/billing/domain/ReceiptEntity';
import { TemplateEntity } from '@/entities/billing/domain/TemplateEntity';

/**
 * Billing Server Actions
 * 
 * Next.js Server Actions that handle HTTP requests and coordinate with Use Cases.
 */

// =============================================================================
// GENERATE RECEIPT
// =============================================================================

export async function generateReceiptAction(data: GenerateReceiptData) {
  console.log('[generateReceiptAction] Starting with data:', data);
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const container: IContainer = ContainerFactory.createContainer();
    const generateReceiptUseCase = container.get<GenerateReceiptUseCase>(
      TOKENS.GenerateReceiptUseCase
    );

    console.log('[generateReceiptAction] Executing use case...');
    const result: ReceiptEntity = await generateReceiptUseCase.execute(data);
    console.log('[generateReceiptAction] Use case result:', result);

    revalidatePath('/dashboard/reservations');

    const plainObject = result.toPlainObject();
    console.log('[generateReceiptAction] Returning plain object:', plainObject);
    return plainObject;
  }, 'generateReceiptAction');
}

// =============================================================================
// SEND RECEIPT BY EMAIL
// =============================================================================

export async function sendReceiptByEmailAction(data: SendReceiptData) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const container: IContainer = ContainerFactory.createContainer();
    const sendReceiptUseCase = container.get<SendReceiptByEmailUseCase>(
      TOKENS.SendReceiptByEmailUseCase
    );

    const result: ReceiptEntity = await sendReceiptUseCase.execute(data);

    revalidatePath('/dashboard/reservations');

    return result.toPlainObject();
  }, 'sendReceiptByEmailAction');
}

// =============================================================================
// GET RECEIPTS BY RESERVATION
// =============================================================================

export async function getReceiptsByReservationAction(reservationId: number) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const container: IContainer = ContainerFactory.createContainer();
    const getReceiptsUseCase = container.get<GetReceiptsByReservationUseCase>(
      TOKENS.GetReceiptsByReservationUseCase
    );

    const results = await getReceiptsUseCase.execute(reservationId);

    return results.map(r => r.toPlainObject());
  }, 'getReceiptsByReservationAction');
}

// =============================================================================
// GET RECEIPT TEMPLATES
// =============================================================================

export async function getReceiptTemplatesAction(activeOnly: boolean = true, searchTerm?: string) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    console.log("getReceiptTemplatesAction called with activeOnly:", activeOnly, "searchTerm:", searchTerm);
    const container: IContainer = ContainerFactory.createContainer();
    const getTemplatesUseCase = container.get<GetReceiptTemplatesUseCase>(
      TOKENS.GetReceiptTemplatesUseCase
    );

    console.log("Executing use case...");
    const results = await getTemplatesUseCase.execute(activeOnly, searchTerm);
    console.log("Use case results:", results);

    const plainObjects = results.map(t => t.toPlainObject());
    console.log("Plain objects:", plainObjects);
    return plainObjects;
  }, 'getReceiptTemplatesAction');
}

// =============================================================================
// PREVIEW TEMPLATE (WITH MOCK DATA)
// =============================================================================

export async function previewTemplateAction(templateId: number) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Call the preview endpoint that renders template with mock data
    const response = await fetch(`${baseUrl}/api/templates/${templateId}/preview`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al generar preview: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Return the PDF URL from the response
    return {
      pdfUrl: data.pdfUrl || data.url || data.data?.pdfUrl,
      receipt: data.receipt || data.data || data,
    };
  }, 'previewTemplateAction');
}

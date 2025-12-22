"use server";

import { revalidatePath } from 'next/cache';
import { ErrorHandlerComposer } from '@/shared/api/error-handler';
import { ContainerFactory } from '@/infrastructure/config/di/container.factory';
import { IContainer } from '@/infrastructure/config/di/simple-container';
import { TOKENS } from '@/infrastructure/config/di/tokens';
import { UploadPaymentProofUseCase } from '@/application/dashboard/billing/use-cases/UploadPaymentProofUseCase';
import { PaymentProofEntity, UploadPaymentProofData } from '@/entities/billing/domain/PaymentProofEntity';
// Import removed to avoid circular dependency

/**
 * Payment Proof Server Actions
 */

// =============================================================================
// UPLOAD PAYMENT PROOF
// =============================================================================

export async function uploadPaymentProofAction(formData: FormData) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const file = formData.get('file') as File;
    const reservationId = parseInt(formData.get('reservationId') as string);
    const uploadedByUserId = parseInt(formData.get('uploadedByUserId') as string);

    if (!file) {
      throw new Error('File is required');
    }

    const container: IContainer = ContainerFactory.createContainer();
    const uploadUseCase = container.get<UploadPaymentProofUseCase>(
      TOKENS.UploadPaymentProofUseCase
    );

    const data: UploadPaymentProofData = {
      file,
      reservationId,
      uploadedByUserId,
    };

    const result: PaymentProofEntity = await uploadUseCase.execute(data);

    revalidatePath(`/reservations/${uploadedByUserId}`);

    return result.toPlainObject();
  }, 'uploadPaymentProofAction');
}

// =============================================================================
// GET PAYMENT PROOFS BY RESERVATION
// =============================================================================

export async function getPaymentProofsByReservationAction(reservationId: number) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const { createPaymentProofRepository } = await import('@/infrastructure/repositories/billing/payment-proof-repository.adapter');
    const { ClientHttpClientFactory, createClientAuthContext } = await import('@/shared/api/http-client-client');
    
    const httpClient = ClientHttpClientFactory.createClient(createClientAuthContext());
    const repository = createPaymentProofRepository(httpClient);
    
    const results = await repository.getByReservationId(reservationId);
    console.log('[getPaymentProofsByReservationAction] Results from repository:', results);
    
    const plainObjects = results.map(r => r.toPlainObject());
    console.log('[getPaymentProofsByReservationAction] Plain objects:', plainObjects);
    
    return plainObjects;
  }, 'getPaymentProofsByReservationAction');
}

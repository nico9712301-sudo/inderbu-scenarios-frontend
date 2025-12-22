"use server";

import { ErrorHandlerComposer } from '@/shared/api/error-handler';
import type { ReservationDto } from '@/entities/reservation/model/types';
import { uploadPaymentProofAction } from './payment-proof.actions';

/**
 * Reservation Server Actions
 * 
 * Next.js Server Actions for handling reservations.
 */

// =============================================================================
// GET RESERVATION BY ID
// =============================================================================

export async function getReservationByIdAction(id: number) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const { ServerHttpClientFactory } = await import('@/shared/api/http-client-server');
    const { createReservationRepository } = await import('@/entities/reservation/infrastructure/reservation-repository.adapter');
    
    // Use ServerHttpClient for server actions to ensure proper authentication
    const httpClient = ServerHttpClientFactory.createServerWithAuth();
    const repository = createReservationRepository(httpClient);
    
    const result = await repository.getById(id);

    return result;
  }, 'getReservationByIdAction');
}

// =============================================================================
// UPLOAD PAYMENT PROOF FOR RESERVATION
// =============================================================================

export async function uploadPaymentProofForReservationAction(formData: FormData) {
  return await uploadPaymentProofAction(formData);
}

"use server";

import { ErrorHandlerComposer } from '@/shared/api/error-handler';
import type { ReservationDto } from '@/entities/reservation/model/types';

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
    const { ClientHttpClientFactory, createClientAuthContext } = await import('@/shared/api/http-client-client');
    const { createReservationRepository } = await import('@/entities/reservation/infrastructure/reservation-repository.adapter');
    
    const httpClient = ClientHttpClientFactory.createClient(createClientAuthContext());
    const repository = createReservationRepository(httpClient);
    
    const result = await repository.getById(id);

    return result;
  }, 'getReservationByIdAction');
}

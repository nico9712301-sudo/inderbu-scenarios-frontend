"use server";

import { revalidatePath, revalidateTag } from 'next/cache';
import { ErrorHandlerComposer } from '@/shared/api/error-handler';
import { ClientHttpClientFactory, createClientAuthContext } from '@/shared/api/http-client-client';
import { BackendResponse } from '@/shared/api/backend-types';
import type { ReservationDto } from '@/entities/reservation/model/types';

export interface ConfirmReservationData {
  justification?: string;
  paymentProofFile?: File;
}

export interface ConfirmReservationResult {
  success: boolean;
  data?: ReservationDto;
  error?: string;
}

/**
 * Confirm Reservation Server Action
 * 
 * Confirms a paid reservation with optional payment proof upload and justification.
 */
export async function confirmReservationAction(
  reservationId: number,
  data: ConfirmReservationData
): Promise<ConfirmReservationResult> {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const httpClient = ClientHttpClientFactory.createClient(createClientAuthContext());

    const formData = new FormData();
    if (data.justification) {
      formData.append('justification', data.justification);
    }
    if (data.paymentProofFile) {
      formData.append('paymentProofFile', data.paymentProofFile);
    }

    const result = await httpClient.post<BackendResponse<ReservationDto>>(
      `/reservations/${reservationId}/confirm`,
      formData
    );

    // Cache invalidation
    revalidateTag(`reservation-${reservationId}`);
    revalidateTag('reservations');
    if (result.data.userId) {
      revalidateTag(`user-${result.data.userId}-reservations`);
    }
    revalidatePath('/dashboard/reservations');

    return result.data;
  }, 'confirmReservationAction');
}

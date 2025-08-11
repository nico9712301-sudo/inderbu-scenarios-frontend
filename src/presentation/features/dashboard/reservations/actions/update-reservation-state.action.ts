"use server";

import { revalidatePath } from 'next/cache';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';

export async function updateReservationStateAction(
  reservationId: number,
  reservationStateId: number
) {
  try {
    // CORRECTO - Con autenticación desde servidor
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);

    // Direct API call with authentication
    const updatedReservation = await httpClient.patch(
      `/reservations/${reservationId}/state`,
      { reservationStateId }
    );

    // Revalidate the dashboard page to show updated data
    revalidatePath('/dashboard');

    return {
      success: true,
      data: updatedReservation,
    };
  } catch (error: any) {
    console.error('Error updating reservation state:', error);
    return {
      success: false,
      error: error.message || 'Error al actualizar el estado de la reserva',
    };
  }
}

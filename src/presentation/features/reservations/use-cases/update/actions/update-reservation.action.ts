'use server';

import { createReservationRepository, ReservationRepository } from '@/entities/reservation/infrastructure/reservation-repository.adapter';
import { ReservationDto, UpdateReservationStateCommand } from '@/entities/reservation/model/types';
import { ClientHttpClient, ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext, ServerAuthContext } from '@/shared/api/server-auth';
import { revalidateTag } from 'next/cache';

export interface UpdateReservationResult {
  success: boolean;
  data?: ReservationDto;
  message?: string;
  error?: string;
}

export async function updateReservationStateAction(
  reservationId: number,
  command: UpdateReservationStateCommand
): Promise<UpdateReservationResult> {
  try {
    // Create repository with server-side authentication context
    const authContext: ServerAuthContext = createServerAuthContext();
    const httpClient: ClientHttpClient = ClientHttpClientFactory.createClient(authContext);
    const repository: ReservationRepository = createReservationRepository(httpClient);

    console.log(`🔄 Updating reservation ${reservationId} state:`, command);

    // Update reservation state through repository
    const updatedReservation: ReservationDto = await repository.updateState(reservationId, command);

    // CACHE INVALIDATION using the response data
    revalidateTag(`reservation-${reservationId}`);
    revalidateTag('reservations');
    
    // GRANULAR INVALIDATION with response data
    if (updatedReservation.userId) {
      revalidateTag(`user-${updatedReservation.userId}-reservations`);
    }
    
    if (updatedReservation.subScenarioId) {
      revalidateTag(`scenario-${updatedReservation.subScenarioId}-reservations`);
      
      // If state change affects availability (e.g., from active to cancelled), invalidate timeslots
      const reservationDate = new Date(updatedReservation.initialDate).toISOString().split('T')[0];
      revalidateTag(`timeslots-${updatedReservation.subScenarioId}-${reservationDate}`);
      revalidateTag(`timeslots-${updatedReservation.subScenarioId}`);
      revalidateTag('timeslots');
    }

    console.log('Reservation state updated successfully:', updatedReservation);

    return {
      success: true,
      data: updatedReservation,
      message: 'Estado de reserva actualizado exitosamente',
    };
  } catch (error) {
    console.error(`Error updating reservation ${reservationId} state:`, error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el estado de la reserva',
    };
  }
}

// Additional helper for updating other reservation fields (future use)
export async function updateReservationAction(
  reservationId: number,
  updateData: Partial<ReservationDto>
): Promise<UpdateReservationResult> {
  try {
    // For now, this could be extended to handle other field updates
    // Currently focusing on state updates as that's what the edit drawer uses
    
    console.log(`🔄 Full reservation update not yet implemented for ${reservationId}`);
    
    return {
      success: false,
      error: 'Actualización completa de reserva no implementada aún',
    };
  } catch (error) {
    console.error(`Error updating reservation ${reservationId}:`, error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar la reserva',
    };
  }
}
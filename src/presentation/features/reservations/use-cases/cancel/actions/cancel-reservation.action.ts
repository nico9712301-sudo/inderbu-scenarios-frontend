'use server';

import { createReservationRepository, ReservationRepository } from '@/entities/reservation/infrastructure/reservation-repository.adapter';
import { ReservationDto } from '@/entities/reservation/model/types';
import { ClientHttpClient, ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext, ServerAuthContext } from '@/shared/api/server-auth';
import { revalidateTag } from 'next/cache';

export interface CancelReservationResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function cancelReservationAction(
  reservationId: number,
  reason?: string
): Promise<CancelReservationResult> {
  try {
    // Create repository with server-side authentication context
    const authContext: ServerAuthContext = createServerAuthContext();
    const httpClient: ClientHttpClient = ClientHttpClientFactory.createClient(authContext);
    const repository: ReservationRepository = createReservationRepository(httpClient);

    // Update state (ya devuelve ReservationDto completo)
    const cancelledReservation: ReservationDto = await repository.updateState(reservationId, {
      reservationStateId: 3, // CANCELADA
    });
  

    // CACHE INVALIDATION usando los datos de la respuesta
    revalidateTag(`reservation-${reservationId}`);
    revalidateTag('reservations');
    
    // GRANULAR INVALIDATION con datos de la respuesta
    if (cancelledReservation.userId) {
      revalidateTag(`user-${cancelledReservation.userId}-reservations`);
    }
    
    if (cancelledReservation.subScenarioId) {
      revalidateTag(`scenario-${cancelledReservation.subScenarioId}-reservations`);
      
      // Liberar timeslots (cancelación libera espacios)
      const reservationDate = new Date(cancelledReservation.initialDate).toISOString().split('T')[0];
      revalidateTag(`timeslots-${cancelledReservation.subScenarioId}-${reservationDate}`);
      revalidateTag(`timeslots-${cancelledReservation.subScenarioId}`);
      revalidateTag('timeslots');
    }

    return {
      success: true,
      message: 'Reserva cancelada exitosamente',
    };
  } catch (error) {
    console.error(`Error cancelling reservation ${reservationId}:`, error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cancelar la reserva',
    };
  }
}

// BATCH CANCEL con invalidación eficiente
export async function cancelMultipleReservationsAction(
  reservationIds: number[],
  reason?: string
): Promise<CancelReservationResult> {
  try {
    const authContext = createServerAuthContext();
    const httpClient = ClientHttpClientFactory.createClient(authContext);
    const repository = createReservationRepository(httpClient);

    // OBTENER TODAS LAS RESERVAS PARA INVALIDACIÓN INTELIGENTE
    const reservations = await Promise.all(
      reservationIds.map(id => repository.getById(id))
    );

    // Cancel all reservations in parallel
    await Promise.all(
      reservationIds.map(id =>
        repository.updateState(id, {
          reservationStateId: 3, // CANCELADA
        })
      )
    );

    // INVALIDACIÓN BATCH OPTIMIZADA
    // Invalidar reservas específicas
    reservationIds.forEach(id => revalidateTag(`reservation-${id}`));
    
    // Invalidar listas generales
    revalidateTag('reservations');
    
    // Collectar contextos únicos para invalidación eficiente
    const uniqueUserIds = [...new Set(reservations.map(r => r.userId).filter(Boolean))];
    const uniqueScenarioIds = [...new Set(reservations.map(r => r.subScenarioId).filter(Boolean))];
    const uniqueDates = [...new Set(reservations.map(r => 
      new Date(r.initialDate).toISOString().split('T')[0]
    ))];

    // Invalidar por usuarios únicos
    uniqueUserIds.forEach(userId => {
      if (userId) revalidateTag(`user-${userId}-reservations`);
    });

    // Invalidar por scenarios únicos y sus timeslots
    uniqueScenarioIds.forEach(scenarioId => {
      if (scenarioId) {
        revalidateTag(`scenario-${scenarioId}-reservations`);
        revalidateTag(`timeslots-${scenarioId}`);
        
        // Invalidar timeslots por fecha específica
        uniqueDates.forEach(date => {
          revalidateTag(`timeslots-${scenarioId}-${date}`);
        });
      }
    });

    // Invalidar timeslots globales
    revalidateTag('timeslots');

    console.log(`${reservationIds.length} reservations cancelled successfully`);

    return {
      success: true,
      message: `${reservationIds.length} reservas canceladas exitosamente`,
    };
  } catch (error) {
    console.error('Error cancelling multiple reservations:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cancelar las reservas',
    };
  }
}

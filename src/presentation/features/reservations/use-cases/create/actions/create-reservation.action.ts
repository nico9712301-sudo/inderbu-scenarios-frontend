'use server';

import { createReservationRepository, ReservationRepository } from '@/entities/reservation/infrastructure/reservation-repository.adapter';
import { CreateReservationDto, CreateReservationResponseDto } from '@/entities/reservation/model/types';
import { ClientHttpClient, ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext, ServerAuthContext } from '@/shared/api/server-auth';
import { revalidateTag } from 'next/cache';

export interface CreateReservationResult {
  success: boolean;
  data?: CreateReservationResponseDto;
  message?: string;
  error?: string;
}

export async function createReservationAction(
  command: CreateReservationDto
): Promise<CreateReservationResult> {
  try {
    // Create repository with server-side authentication context
    const authContext: ServerAuthContext = createServerAuthContext();
    const httpClient: ClientHttpClient = ClientHttpClientFactory.createClient(authContext);
    const repository: ReservationRepository = createReservationRepository(httpClient);

    console.log('Creating reservation with command:', command);

    // Create reservation through repository
    const result: CreateReservationResponseDto = await repository.create(command);

    // CACHE INVALIDATION - Invalidate relevant caches
    revalidateTag('reservations');
    
    // GRANULAR INVALIDATION with command data
    if (command.subScenarioId) {
      revalidateTag(`scenario-${command.subScenarioId}-reservations`);
      
      // Invalidate timeslots for the booked date (availability changed)
      const reservationDate = new Date(command.reservationRange.initialDate).toISOString().split('T')[0];
      revalidateTag(`timeslots-${command.subScenarioId}-${reservationDate}`);
      revalidateTag(`timeslots-${command.subScenarioId}`);
      revalidateTag('timeslots');
    }

    // Invalidate user-specific reservations cache
    if (result.userId) {
      revalidateTag(`user-${result.userId}-reservations`);
    }
    
    // Also invalidate all users cache for dashboard view (userId=0)
    revalidateTag(`user-0-reservations`);

    console.log('Reservation created successfully:', result);

    return {
      success: true,
      data: result,
      message: 'Reserva creada exitosamente',
    };
  } catch (error) {
    console.error('Error creating reservation:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear la reserva',
    };
  }
}
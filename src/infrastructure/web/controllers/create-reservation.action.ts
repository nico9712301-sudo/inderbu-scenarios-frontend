'use server';

import { createReservationRepository, ReservationRepository } from '@/entities/reservation/infrastructure/reservation-repository.adapter';
import { CreateReservationDto, CreateReservationResponseDto, CreateReservationSchema } from '@/entities/reservation/model/types';
import { ClientHttpClient, ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { ServerHttpClientFactory } from '@/shared/api/http-client-server';
import { createServerAuthContext, ServerAuthContext } from '@/shared/api/server-auth';
import { createFormDataValidator } from '@/shared/utils/utils';
import { revalidateTag } from 'next/cache';

/**
 * Create Reservation Server Actions
 * 
 * Next.js Server Actions that handle reservation creation.
 * Acts as controller in the Clean Architecture.
 */

export interface CreateReservationResult {
  success: boolean;
  data?: CreateReservationResponseDto | { id: number; reservationDate: string };
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

const validateCreateReservation = createFormDataValidator(CreateReservationSchema);

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

// Form-based version for UI form submissions
export async function createReservationFromFormAction(
  prevState: CreateReservationResult | null,
  formData: FormData
): Promise<CreateReservationResult> {
  try {
    // Validate input
    const command = validateCreateReservation(formData);

    // Use ServerHttpClientFactory for server actions
    const httpClient = ServerHttpClientFactory.createServerWithAuth();
    const repository = createReservationRepository(httpClient);

    // Execute command
    const reservation = await repository.create(command);

    // Invalidate cache
    revalidateTag('reservations');
    revalidateTag(`reservations-user-${reservation.userId}`);

    console.log(`Reservation created successfully: ${reservation.id}`);

    return {
      success: true,
      data: {
        id: reservation.id,
        reservationDate: reservation.reservationDate,
      },
    };
  } catch (error) {
    console.error('Error creating reservation from form:', error);

    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return {
          success: false,
          error: 'Datos de entrada inválidos',
          fieldErrors: { general: [error.message] },
        };
      }

      return {
        success: false,
        error: error.message || 'Error interno del servidor',
      };
    }

    return {
      success: false,
      error: 'Error inesperado al crear la reserva',
    };
  }
}

// Simplified version for direct calls (with validation)
export async function createReservation(command: CreateReservationDto): Promise<CreateReservationResult> {
  try {
    console.log('Server Action createReservation: Starting execution');
    console.log('Input command:', command);
    
    // Validate input
    console.log('Validating input with schema...');
    const validatedCommand = CreateReservationSchema.parse(command);
    console.log('Validation successful:', validatedCommand);

    // Create server HTTP client with auth context
    console.log('Creating server HTTP client with auth...');
    const httpClient = ServerHttpClientFactory.createServerWithAuth();
    
    console.log('Creating reservation repository...');
    const repository = createReservationRepository(httpClient);

    // Execute command
    console.log('Executing repository.create...');
    const reservation = await repository.create(validatedCommand);
    console.log('Repository result:', reservation);

    // Invalidate cache
    console.log('Invalidating cache...');
    revalidateTag('reservations');
    revalidateTag(`reservations-user-${reservation.userId}`);
    console.log('Cache invalidated');

    const result = {
      success: true,
      data: {
        id: reservation.id,
        reservationDate: reservation.reservationDate,
      },
    };
    
    console.log('Server Action createReservation: Success result:', result);
    return result;
    
  } catch (error) {
    console.error('Server Action createReservation: Error occurred:', error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown');

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error inesperado',
    };
  }
}
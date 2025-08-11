'use server';

import { createReservationRepository } from '@/entities/reservation/infrastructure/reservation-repository.adapter';
import { CreateReservationDto, CreateReservationSchema } from '@/entities/reservation/model/types';
import { ServerHttpClientFactory } from '@/shared/api/http-client-server';
import { createFormDataValidator } from '@/shared/utils/utils';
import { revalidateTag } from 'next/cache';

export interface CreateReservationResult {
  success: boolean;
  data?: { id: number; reservationDate: string };
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

const validateCreateReservation = createFormDataValidator(CreateReservationSchema);

// This action is used to create a reservation from a form submission in the UI.
export async function createReservationAction(
  prevState: CreateReservationResult | null,
  formData: FormData
): Promise<CreateReservationResult> {
  try {
    // Validate input
    const command = validateCreateReservation(formData);

    // FIXED: Use ServerHttpClientFactory for server actions
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
    console.error('Error creating reservation:', error);

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

// Simplified version for direct calls (not form-based)
export async function createReservation(command: CreateReservationDto): Promise<CreateReservationResult> {
  try {
    console.log('Server Action createReservation: Starting execution');
    console.log('Input command:', command);
    
    // Validate input
    console.log('Validating input with schema...');
    const validatedCommand = CreateReservationSchema.parse(command);
    console.log('Validation successful:', validatedCommand);

    // FIXED: Create server HTTP client with auth context
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

'use server';

import { createReservationRepository } from '@/entities/reservation/infrastructure/reservation-repository.adapter';
import { 
  CreateReservationDto, 
  CreateReservationResponseDto,
  CreateReservationSchema
} from '@/entities/reservation/model/types';
import { IHttpClient } from '@/shared/api/types';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { ServerHttpClientFactory } from '@/shared/api/http-client-server';
import { createServerAuthContext } from '@/shared/api/server-auth';
// Removed createFormDataValidator import to avoid server/client boundary issues
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

// Removed module-level validator to avoid server/client boundary issues

export async function createReservationAction(
  command: CreateReservationDto
): Promise<CreateReservationResult> {
  try {
    // Create repository with server-side authentication context
    const authContext = createServerAuthContext();
    const httpClient: IHttpClient = ClientHttpClientFactory.createClient(authContext);
    const repository = createReservationRepository(httpClient);

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
    // Convert FormData to object manually (server-safe way)
    const data: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      // Handle arrays (multiple values with same key)
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }

    // Validate with Zod schema directly (server-safe)
    const command = CreateReservationSchema.parse(data);

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
    try {
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
    } catch (repoError) {
      // Re-throw to outer catch to handle it properly
      console.log('Repository error caught, re-throwing to outer catch:', repoError);
      throw repoError;
    }
    
  } catch (error) {
    console.error('Server Action createReservation: Error occurred:', error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown');
    console.error('Error details:', (error as any)?.details);
    console.error('Error data:', (error as any)?.errorData);
    console.error('Error originalError:', (error as any)?.originalError);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

    // Try to extract detailed error message from API error response
    // Default to a generic message, but we'll try to extract the actual message from the error
    let errorMessage = 'Error inesperado';
    
    console.log('[createReservation] Extracting error message...');
    console.log('[createReservation] Error type:', error?.constructor?.name);
    console.log('[createReservation] Error instanceof Error:', error instanceof Error);
    console.log('[createReservation] Error object:', JSON.stringify(error, null, 2));
    
    // Handle both Error instances and plain objects (from ServerHttpClient)
    if (error instanceof Error) {
      // Start with the error message
      errorMessage = error.message || 'Error inesperado';
      console.log('[createReservation] Initial error message:', errorMessage);
      
      // Check multiple sources for conflict details
      // 1. Direct details on error
      let errorDetails = (error as any)?.details;
      console.log('[createReservation] Direct details:', errorDetails);
      
      // 2. From originalError if available
      if (!errorDetails && (error as any)?.originalError) {
        errorDetails = (error as any)?.originalError?.details || (error as any)?.originalError?.errorData?.details;
        console.log('[createReservation] Details from originalError:', errorDetails);
      }
      
      // 3. From errorData if available
      if (!errorDetails && (error as any)?.errorData) {
        errorDetails = (error as any)?.errorData?.details;
        console.log('[createReservation] Details from errorData:', errorDetails);
      }
      
      // Build detailed conflict message if conflicts found
      if (errorDetails && errorDetails.conflicts && Array.isArray(errorDetails.conflicts)) {
        console.log('[createReservation] Found conflicts:', errorDetails.conflicts);
        const conflictMessages = errorDetails.conflicts.map((c: any) => {
          return `Fecha ${c.date}, horario ${c.timeslotId}`;
        });
        errorMessage = `${errorMessage}. Conflictos en: ${conflictMessages.join('; ')}`;
        console.log('[createReservation] Final error message with conflicts:', errorMessage);
      } else {
        console.log('[createReservation] No conflicts found in errorDetails');
      }
    } else if (error && typeof error === 'object') {
      // Handle plain objects (from ServerHttpClient ApiError)
      console.log('[createReservation] Error is a plain object, extracting message...');
      console.log('[createReservation] Error object structure:', {
        hasMessage: !!(error as any).message,
        message: (error as any).message,
        messageType: typeof (error as any).message,
        statusCode: (error as any).statusCode,
        allKeys: Object.keys(error as any),
      });
      
      // Extract message from object - USE THE MESSAGE DIRECTLY FROM BACKEND
      // The backend sends the error message, we should use it instead of "Error inesperado"
      if ((error as any).message) {
        const backendMessage = typeof (error as any).message === 'string' 
          ? (error as any).message 
          : Array.isArray((error as any).message)
            ? (error as any).message.join(', ')
            : null;
        
        if (backendMessage) {
          errorMessage = backendMessage; // Use the actual backend message!
          console.log('[createReservation] Using backend message:', errorMessage);
        } else {
          console.log('[createReservation] Backend message is null or invalid');
        }
      } else {
        console.log('[createReservation] No message property in error object');
        // Fallback: try to build a message from statusCode
        if ((error as any).statusCode === 409) {
          errorMessage = 'Algunos horarios ya están ocupados';
        }
      }
      
      // Check for details in the error object (may not be present if backend filter didn't include them)
      let errorDetails = (error as any)?.details;
      if (!errorDetails && (error as any)?.errorData) {
        errorDetails = (error as any)?.errorData?.details;
      }
      
      console.log('[createReservation] Error details from object:', errorDetails);
      console.log('[createReservation] Full error object keys:', Object.keys(error as any));
      
      // Build detailed conflict message if conflicts found
      if (errorDetails && errorDetails.conflicts && Array.isArray(errorDetails.conflicts)) {
        console.log('[createReservation] Found conflicts in object:', errorDetails.conflicts);
        const conflictMessages = errorDetails.conflicts.map((c: any) => {
          return `Fecha ${c.date}, horario ${c.timeslotId}`;
        });
        errorMessage = `${errorMessage}. Conflictos en: ${conflictMessages.join('; ')}`;
        console.log('[createReservation] Final error message with conflicts:', errorMessage);
      } else {
        console.log('[createReservation] No conflicts found in error object, but using backend message:', errorMessage);
      }
    } else {
      console.log('[createReservation] Error is not an Error instance or object, using default message');
    }

    console.log('[createReservation] Final error message to return:', errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}
import { ApiHttpError } from "@/shared/api/http-client-client";
import { ReservationDomainError } from "@/entities/reservation/domain/ReservationEntity";
import { ApiError } from "@/shared/api/types";

/**
 * Envuelve una promesa y la transforma en un ReservationDomainError con mensaje contextual.
 * Maneja gracefully los errores post-logout para evitar logs innecesarios.
 */
export async function executeWithDomainError<T>(
  action: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await action();
  } catch (error) {

    // Handle post-logout 401 errors gracefully from Client HTTP Client
    if (error instanceof ApiHttpError && error.statusCode === 401) {
      // Check if this is marked as post-logout
      if ((error as any).isPostLogout) {
        console.warn(`Post-logout request detected for: ${errorMessage} - returning empty result`);

        // For paginated responses, return empty pagination structure
        if (errorMessage.includes('fetch')) {
          return {
            data: [],
            meta: {
              page: 1,
              limit: 20,
              totalItems: 0,
              totalPages: 0,
            },
          } as unknown as T;
        }

        // For single item requests, return null
        return null as unknown as T;
      }

      // Additional check by message for post-logout cases
      if (error.message === 'Authentication required - session ended') {
        console.warn(`Post-logout request detected by message for: ${errorMessage} - returning empty result`);

        // For paginated responses, return empty pagination structure
        if (errorMessage.includes('fetch')) {
          return {
            data: [],
            meta: {
              page: 1,
              limit: 20,
              totalItems: 0,
              totalPages: 0,
            },
          } as unknown as T;
        }

        // For single item requests, return null
        return null as unknown as T;
      }
    }

    // Handle server HTTP client errors (ApiError type)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const apiError = error as ApiError;
      
      if (apiError.isPostLogout && apiError.statusCode === 401) {
        console.warn(`Post-logout request detected via server client for: ${errorMessage} - returning empty result`);

        // For paginated responses, return empty pagination structure
        if (errorMessage.includes('fetch')) {
          return {
            data: [],
            meta: {
              page: 1,
              limit: 20,
              totalItems: 0,
              totalPages: 0,
            },
          } as unknown as T;
        }

        // For single item requests, return null
        return null as unknown as T;
      }
      
      // For other ApiError instances, preserve details and convert to ReservationDomainError
      console.log('[executeWithDomainError] ApiError caught (server client):', {
        statusCode: apiError.statusCode,
        message: apiError.message,
        hasDetails: !!(apiError as any).details,
        hasErrorData: !!(apiError as any).errorData,
        details: (apiError as any).details,
        errorData: (apiError as any).errorData,
      });
      
      // Build detailed error message
      let detailedMessage = typeof apiError.message === 'string' 
        ? apiError.message 
        : Array.isArray(apiError.message) 
          ? apiError.message.join(', ')
          : `${errorMessage} (Backend ${apiError.statusCode})`;
      
      // Check for conflict details
      let errorDetails = (apiError as any).details;
      if (!errorDetails && (apiError as any).errorData) {
        errorDetails = (apiError as any).errorData.details;
      }
      
      if (errorDetails && errorDetails.conflicts && Array.isArray(errorDetails.conflicts)) {
        console.log('[executeWithDomainError] Found conflicts in ApiError:', errorDetails.conflicts);
        const conflictMessages = errorDetails.conflicts.map((c: any) => {
          return `Fecha ${c.date}, horario ${c.timeslotId}`;
        });
        detailedMessage = `${detailedMessage}. Conflictos en: ${conflictMessages.join('; ')}`;
      }
      
      const domainError = new ReservationDomainError(detailedMessage);
      
      // Preserve details
      if ((apiError as any).details) {
        (domainError as any).details = (apiError as any).details;
      }
      if ((apiError as any).errorData) {
        (domainError as any).errorData = (apiError as any).errorData;
        if ((apiError as any).errorData.details) {
          (domainError as any).details = (apiError as any).errorData.details;
        }
      }
      (domainError as any).statusCode = apiError.statusCode;
      (domainError as any).originalError = apiError;
      
      console.log('[executeWithDomainError] Final domainError from ApiError:', {
        message: domainError.message,
        hasDetails: !!(domainError as any).details,
        details: (domainError as any).details,
      });
      
      throw domainError;
    }

    // Handle normal API errors
    if (error instanceof ApiHttpError) {
      console.log('[executeWithDomainError] ApiHttpError caught:', {
        statusCode: error.statusCode,
        message: error.message,
        hasDetails: !!(error as any).details,
        hasErrorData: !!(error as any).errorData,
        details: (error as any).details,
        errorData: (error as any).errorData,
      });
      
      // Build a detailed error message that includes conflict information
      let detailedMessage = error.message || `${errorMessage} (Backend ${error.statusCode})`;
      
      // Check for conflict details and build detailed message
      let errorDetails = (error as any).details;
      if (!errorDetails && (error as any).errorData) {
        errorDetails = (error as any).errorData.details;
      }
      
      if (errorDetails && errorDetails.conflicts && Array.isArray(errorDetails.conflicts)) {
        const conflictMessages = errorDetails.conflicts.map((c: any) => {
          return `Fecha ${c.date}, horario ${c.timeslotId}`;
        });
        detailedMessage = `${detailedMessage}. Conflictos en: ${conflictMessages.join('; ')}`;
      }
      
      // Preserve error details (like conflicts) by attaching them to the error
      const domainError = new ReservationDomainError(detailedMessage);
      
      // Attach original error details if available
      if ((error as any).details) {
        (domainError as any).details = (error as any).details;
        console.log('[executeWithDomainError] Attached details to domainError:', (domainError as any).details);
      }
      if ((error as any).errorData) {
        (domainError as any).errorData = (error as any).errorData;
        // Also check if errorData has details
        if ((error as any).errorData.details) {
          (domainError as any).details = (domainError as any).errorData.details;
          console.log('[executeWithDomainError] Attached errorData.details to domainError:', (domainError as any).details);
        }
      }
      (domainError as any).statusCode = error.statusCode;
      (domainError as any).originalError = error;
      
      console.log('[executeWithDomainError] Final domainError:', {
        message: domainError.message,
        hasDetails: !!(domainError as any).details,
        details: (domainError as any).details,
      });
      
      throw domainError;
    }

    const domainError = new ReservationDomainError(
      `${errorMessage}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    
    // Preserve any error details from the original error
    if (error && typeof error === 'object' && 'details' in error) {
      (domainError as any).details = (error as any).details;
    }
    
    throw domainError;
  }
}
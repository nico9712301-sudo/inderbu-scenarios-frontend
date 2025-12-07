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
    if (error && typeof error === 'object' && 'statusCode' in error && 'isPostLogout' in error) {
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
    }

    // Handle normal API errors
    if (error instanceof ApiHttpError) {
      throw new ReservationDomainError(
        `${errorMessage} (Backend ${error.statusCode}: ${error.message})` +
        String(error.statusCode)
      );
    }

    throw new ReservationDomainError(
      `${errorMessage}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
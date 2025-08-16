import { ApiHttpError } from "@/shared/api/http-client-client";

/**
 * Auth User Domain Error for authentication repository operations
 */
export class AuthUserDomainError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthUserDomainError';
  }
}

/**
 * Envuelve una promesa y la transforma en un AuthUserDomainError con mensaje contextual.
 */
export async function executeWithDomainError<T>(
  action: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ApiHttpError) {
      throw new AuthUserDomainError(
        `${errorMessage} (Backend ${error.statusCode}: ${error.message})`,
        String(error.statusCode)
      );
    }
    throw new AuthUserDomainError(
      `${errorMessage}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
import { ApiHttpError } from "@/shared/api/http-client-client";

/**
 * Role Domain Error for repository operations
 */
export class RoleDomainError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'RoleDomainError';
  }
}

/**
 * Envuelve una promesa y la transforma en un RoleDomainError con mensaje contextual.
 */
export async function executeWithDomainError<T>(
  action: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ApiHttpError) {
      throw new RoleDomainError(
        `${errorMessage} (Backend ${error.statusCode}: ${error.message})`,
        String(error.statusCode)
      );
    }
    throw new RoleDomainError(
      `${errorMessage}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
import { ApiHttpError } from "@/shared/api/http-client-client";

/**
 * Envuelve una promesa y maneja errores de dominio para operaciones de billing.
 */
export async function executeWithDomainError<T>(
  action: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ApiHttpError) {
      throw new Error(
        `${errorMessage} (Backend ${error.statusCode}: ${error.message})`
      );
    }
    throw new Error(
      `${errorMessage}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

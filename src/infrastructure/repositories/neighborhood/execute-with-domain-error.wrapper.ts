import { NeighborhoodDomainError } from "@/entities/neighborhood/domain/NeighborhoodEntity";
import { ApiHttpError } from "@/shared/api/http-client-client";

/**
 * Envuelve una promesa y la transforma en un NeighborhoodDomainError con mensaje contextual.
 */
export async function executeWithDomainError<T>(
  action: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ApiHttpError) {
      throw new NeighborhoodDomainError(
        `${errorMessage} (Backend ${error.statusCode}: ${error.message})` +
        String(error.statusCode)
      );
    }
    throw new NeighborhoodDomainError(
      `${errorMessage}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
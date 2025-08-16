import { ApiHttpError } from "@/shared/api/http-client-client";
import { ReservationDomainError } from "@/entities/reservation/domain/ReservationEntity";

/**
 * Envuelve una promesa y la transforma en un ReservationDomainError con mensaje contextual.
 */
export async function executeWithDomainError<T>(
  action: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await action();
  } catch (error) {
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
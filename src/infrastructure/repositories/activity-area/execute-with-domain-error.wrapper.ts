import { ApiHttpError } from "@/shared/api/http-client-client";
import { ActivityAreaDomainError } from "@/entities/activity-area/domain/ActivityAreaEntity";

/**
 * Envuelve una promesa y la transforma en un ActivityAreaDomainError con mensaje contextual.
 */
export async function executeWithDomainError<T>(
  action: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ApiHttpError) {
      throw new ActivityAreaDomainError(
        `${errorMessage} (Backend ${error.statusCode}: ${error.message})` +
          String(error.statusCode)
      );
    }
    throw new ActivityAreaDomainError(
      `${errorMessage}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

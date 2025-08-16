import { ApiHttpError } from "@/shared/api/http-client-client";
import { ScenarioDomainError } from "@/entities/scenario/domain/ScenarioEntity";

/**
 * Envuelve una promesa y la transforma en un ScenarioDomainError con mensaje contextual.
 */
export async function executeWithDomainError<T>(
  action: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ApiHttpError) {
      throw new ScenarioDomainError(
        `${errorMessage} (Backend ${error.statusCode}: ${error.message})`,
        String(error.statusCode)
      );
    }
    throw new ScenarioDomainError(
      `${errorMessage}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

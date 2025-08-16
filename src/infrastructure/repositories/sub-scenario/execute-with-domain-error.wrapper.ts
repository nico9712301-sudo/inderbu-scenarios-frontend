import { ApiHttpError } from "@/shared/api/http-client-client";
import { SubScenarioDomainError } from "@/entities/sub-scenario/domain/SubScenarioEntity";

/**
 * Envuelve una promesa y la transforma en un SubScenarioDomainError con mensaje contextual.
 */
export async function executeWithDomainError<T>(
  action: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ApiHttpError) {
      throw new SubScenarioDomainError(
        `${errorMessage} (Backend ${error.statusCode}: ${error.message})`,
        String(error.statusCode)
      );
    }
    throw new SubScenarioDomainError(
      `${errorMessage}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
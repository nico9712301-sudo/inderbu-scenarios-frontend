import { ApiHttpError } from "@/shared/api/http-client-client";
import { FieldSurfaceTypeDomainError } from "@/entities/field-surface-type/domain/FieldSurfaceTypeEntity";

/**
 * Envuelve una promesa y la transforma en un FieldSurfaceTypeDomainError con mensaje contextual.
 */
export async function executeWithDomainError<T>(
  action: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ApiHttpError) {
      throw new FieldSurfaceTypeDomainError(
        `${errorMessage} (Backend ${error.statusCode}: ${error.message})`,
        String(error.statusCode)
      );
    }
    throw new FieldSurfaceTypeDomainError(
      `${errorMessage}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
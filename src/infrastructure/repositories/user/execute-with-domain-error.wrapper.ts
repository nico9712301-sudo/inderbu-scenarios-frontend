import { UserDomainError } from "@/entities/user/domain/UserEntity";

import { ApiHttpError } from "@/shared/api/http-client-client";

/**
 * Envuelve una promesa y la transforma en un UserDomainError con mensaje contextual.
 */
export async function executeWithDomainError<T>(
  action: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ApiHttpError) {
      throw new UserDomainError(
        `${errorMessage} (Backend ${error.statusCode}: ${error.message})`,
        String(error.statusCode)
      );
    }
    throw new UserDomainError(
      `${errorMessage}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
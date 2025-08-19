import { CommuneDomainError } from "@/entities/commune/domain/CommuneEntity";
import { ApiHttpError } from "@/shared/api/http-client-client";

export async function executeWithDomainError<T>(
  operation: () => Promise<T>,
  errorContext: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorContext}:`, error);

    if (error instanceof CommuneDomainError) {
      throw error;
    }

    if (error instanceof ApiHttpError) {
      throw new CommuneDomainError(
        `${errorContext}: ${error.message}`,
        error.status?.toString()
      );
    }

    if (error instanceof Error) {
      throw new CommuneDomainError(`${errorContext}: ${error.message}`);
    }

    throw new CommuneDomainError(`${errorContext}: Unknown error occurred`);
  }
}
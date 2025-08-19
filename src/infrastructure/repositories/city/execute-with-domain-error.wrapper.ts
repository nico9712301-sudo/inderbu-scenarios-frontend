import { CityDomainError } from "@/entities/city/domain/CityEntity";
import { ApiHttpError } from "@/shared/api/http-client-client";

export async function executeWithDomainError<T>(
  operation: () => Promise<T>,
  errorContext: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorContext}:`, error);

    if (error instanceof CityDomainError) {
      throw error;
    }

    if (error instanceof ApiHttpError) {
      throw new CityDomainError(
        `${errorContext}: ${error.message}`,
        error.status?.toString()
      );
    }

    if (error instanceof Error) {
      throw new CityDomainError(`${errorContext}: ${error.message}`);
    }

    throw new CityDomainError(`${errorContext}: Unknown error occurred`);
  }
}
import { ApiHttpError } from "@/shared/api/http-client-client";

/**
 * Auth User Domain Error for authentication repository operations
 */
export class AuthUserDomainError extends Error {
  constructor(
    message: string, 
    public code?: string,
    public originalMessage?: string
  ) {
    super(message);
    this.name = 'AuthUserDomainError';
  }
}

/**
 * Envuelve una promesa y la transforma en un AuthUserDomainError con mensaje contextual.
 * Preserva el mensaje original del backend para que pueda ser usado en la UI.
 */
export async function executeWithDomainError<T>(
  action: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ApiHttpError) {
      // Preservar el mensaje original del backend (error.message contiene el mensaje del backend)
      const backendMessage = error.message;
      throw new AuthUserDomainError(
        backendMessage, // Usar el mensaje original del backend directamente
        String(error.statusCode),
        backendMessage // Guardar también como originalMessage para referencia
      );
    }
    throw new AuthUserDomainError(
      `${errorMessage}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
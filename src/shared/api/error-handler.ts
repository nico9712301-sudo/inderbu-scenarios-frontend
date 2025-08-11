export interface ApiError {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

export type ErrorHandlerResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; statusCode?: number };

/**
 * Template Method Pattern for error handling
 * Provides consistent error handling across all operations
 */
export abstract class ErrorHandler {
  /**
   * Template method that defines the error handling algorithm
   */
  async handleOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<ErrorHandlerResult<T>> {
    try {
      this.beforeOperation(operationName);
      const result = await operation();
      this.onSuccess(operationName, result);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      const errorResult = this.onError(operationName, error);
      this.afterError(operationName, error);
      
      return errorResult;
    }
  }

  // Hook methods that can be overridden by subclasses
  protected beforeOperation(operationName: string): void {
    // Override if needed
  }

  protected onSuccess<T>(operationName: string, result: T): void {
    // Override if needed
  }

  protected afterError(operationName: string, error: unknown): void {
    // Override if needed
  }

  // Abstract method that must be implemented by subclasses
  protected abstract onError(operationName: string, error: unknown): {
    success: false;
    error: string;
    statusCode?: number;
  };
}

/**
 * Default error handler for application operations
 */
export class ApplicationErrorHandler extends ErrorHandler {
  protected onError(operationName: string, error: unknown): {
    success: false;
    error: string;
    statusCode?: number;
  } {
    console.error(`Error in ${operationName}:`, error);

    // Handle ApiError (from HTTP client)
    if (this.isApiError(error)) {
      return {
        success: false,
        error: error.message || `Error en ${operationName}`,
        statusCode: error.statusCode
      };
    }

    // Handle generic Error
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message || `Error inesperado en ${operationName}`
      };
    }

    // Handle unknown error types
    return {
      success: false,
      error: `Error inesperado en ${operationName}`
    };
  }

  protected afterError(operationName: string, error: unknown): void {
    // Log error details for debugging
    console.error(`${operationName} failed:`, {
      error,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    });
  }

  private isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      'message' in error &&
      'timestamp' in error &&
      'path' in error
    );
  }
}

/**
 * Composition utility for wrapping operations with error handling
 */
export class ErrorHandlerComposer {
  private static instance: ApplicationErrorHandler = new ApplicationErrorHandler();

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<ErrorHandlerResult<T>> {
    return this.instance.handleOperation(operation, operationName);
  }

  /**
   * For use cases and actions that need custom error handling
   */
  static withCustomHandler<T>(
    handler: ErrorHandler,
    operation: () => Promise<T>,
    operationName: string
  ): Promise<ErrorHandlerResult<T>> {
    return handler.handleOperation(operation, operationName);
  }
}

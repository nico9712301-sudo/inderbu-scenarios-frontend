/**
 * Standard backend response structure
 * Used for endpoints that wrap their data in a consistent format
 */
export interface BackendResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

/**
 * Backend paginated response structure
 */
export interface BackendPaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  message: string;
  statusCode: number;
}

/**
 * Type guard to check if response is a BackendResponse
 */
export function isBackendResponse<T>(response: any): response is BackendResponse<T> {
  return (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    'message' in response &&
    'statusCode' in response
  );
}
// API Response types matching the exact backend structure
export interface PageMetaDto {
  readonly page: number;
  readonly limit: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

// For paginated responses
export interface PaginatedApiResponse<T> {
  statusCode: number;
  message: string;
  data: T[];
  meta: PageMetaDto;
}

// For simple responses
export interface SimpleApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// API Error structure (from HttpExceptionFilter)
export interface ApiError {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
  isPostLogout?: boolean; // Flag to indicate this is a post-logout request
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams {
  search?: string;
}

// Reservation-specific query params (matching the current working service)
export interface ReservationQueryParams extends PaginationParams, SearchParams {
  scenarioId?: number;
  activityAreaId?: number;
  neighborhoodId?: number;
  userId?: number;
  dateFrom?: string; // YYYY-MM-DD format
  dateTo?: string;   // YYYY-MM-DD format
  searchQuery?: string; // Note: current service uses searchQuery, not search
}

// Request configuration interface
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
  next?: {
    tags?: string[];
    revalidate?: number | false;
  };
}

// Common HTTP Client interface (compatible with both Client and Server implementations)
export interface IHttpClient {
  get<T>(endpoint: string, config?: RequestConfig): Promise<T>;
  post<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T>;
  put<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T>;
  patch<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T>;
  delete<T>(endpoint: string, config?: RequestConfig): Promise<T>;
}

// Alias for backward compatibility
export type HttpClient = IHttpClient;

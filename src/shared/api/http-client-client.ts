import { AuthContext, createClientAuthContext } from "./auth";
import { IHttpClient, RequestConfig } from "./types";

export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  authContext?: AuthContext;
  headers?: Record<string, string>;
}

/**
 * Standard API HTTP Error class
 */
export class ApiHttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly path: string,
    public readonly timestamp: string,
    public readonly details?: unknown
  ) {
    super(Array.isArray(details) ? details.join(", ") : String(details ?? ""));
    this.name = "ApiHttpError";
  }

  static isApiHttpError(err: unknown): err is ApiHttpError {
    return err instanceof ApiHttpError;
  }
}

/**
 * Client-only HTTP implementation using Fetch API
 */
export class ClientHttpClient implements IHttpClient {
  private readonly baseURL: string;
  private readonly timeout: number;
  private readonly authContext?: AuthContext;
  private readonly defaultHeaders: Record<string, string>;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, "") || "http://localhost:3001";
    this.timeout = config.timeout ?? 10000;
    this.authContext = config.authContext || undefined;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    };
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    if (!this.authContext) return {};
    const token = await this.authContext.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async buildHeaders(
    customHeaders?: Record<string, string>
  ): Promise<Record<string, string>> {
    return {
      ...this.defaultHeaders,
      ...(await this.getAuthHeaders()),
      ...customHeaders,
    };
  }

  private async parseJsonSafe<T>(response: Response): Promise<T | null> {
    try {
      return (await response.json()) as T;
    } catch {
      return null;
    }
  }

  private isAbortError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as any).name === "AbortError"
    );
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    options: { body?: any; config?: RequestConfig } = {}
  ): Promise<T> {
    const { body, config = {} } = options;
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.buildHeaders(config.headers);

    if (body instanceof FormData) {
      delete headers["Content-Type"];
    }

    // Detect bulk operations and increase timeout
    const isBulkOperation = endpoint.includes('/state') && body?.additionalReservationIds?.length > 0;
    const defaultTimeout = isBulkOperation ? 60000 : this.timeout; // 60s for bulk operations

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      config.timeout ?? defaultTimeout
    );

    try {
      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: config.signal ?? controller.signal,
        credentials: "include",
      };

      if (config.next) {
        (fetchOptions as any).next = config.next;
      }

      if (body && method !== "GET") {
        fetchOptions.body =
          body instanceof FormData ? body : JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await this.parseJsonSafe<any>(response);
        
        // Log error data for debugging
        console.log('[HttpClient] Error response:', {
          status: response.status,
          errorData,
          hasDetails: !!errorData?.details,
          hasConflicts: !!errorData?.details?.conflicts,
        });

        // Special handling for 401 Unauthorized - could be post-logout race condition
        if (response.status === 401) {
          // Check if this might be a post-logout request by attempting to get token
          const token = this.authContext ? await this.authContext.getToken() : null;

          if (!token) {
            // No token available - this is likely a post-logout request
            // Log as warning instead of error and add post-logout flag
            console.warn('HTTP Client: 401 Unauthorized - likely post-logout request, suppressing error for:', endpoint);

            const gracefulError = new ApiHttpError(
              401,
              errorData?.path ?? endpoint,
              errorData?.timestamp ?? new Date().toISOString(),
              'Authentication required - session ended'
            );

            // Add post-logout flag for wrapper detection
            (gracefulError as any).isPostLogout = true;
            throw gracefulError;
          }
        }

        // Include full error data in details for better error handling
        const errorMessage = errorData?.message ?? response.statusText;
        const error = new ApiHttpError(
          errorData?.statusCode ?? response.status,
          errorData?.path ?? endpoint,
          errorData?.timestamp ?? new Date().toISOString(),
          errorMessage
        );
        
        // Attach additional error details (like conflicts) to the error object
        if (errorData?.details) {
          (error as any).details = errorData.details;
        }
        
        // Also attach the full error data for debugging
        (error as any).errorData = errorData;
        
        throw error;
      }

      const data = await this.parseJsonSafe<T>(response);
      return data as T;
    } catch (err) {
      clearTimeout(timeoutId);

      if (this.isAbortError(err)) {
        throw new Error("Request timeout");
      }

      throw err;
    }
  }

  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>("GET", endpoint, { config });
  }

  post<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>("POST", endpoint, { body, config });
  }

  put<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>("PUT", endpoint, { body, config });
  }

  patch<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>("PATCH", endpoint, { body, config });
  }

  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>("DELETE", endpoint, { config });
  }
}

/**
 * Factory for ClientHttpClient
 */
export class ClientHttpClientFactory {
  private static readonly CLIENT_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  static createClient(authContext?: AuthContext): ClientHttpClient {
    return new ClientHttpClient({
      baseURL: this.CLIENT_BASE_URL,
      authContext,
    });
  }

  static createClientWithAuth(): ClientHttpClient {
    return this.createClient(createClientAuthContext());
  }

  static createClientWithCookies(): ClientHttpClient {
    return new ClientHttpClient({
      baseURL: this.CLIENT_BASE_URL,
    });
  }
}

export { createClientAuthContext };

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
    this.baseURL = config.baseURL.replace(/\/$/, "");
    this.timeout = config.timeout ?? 10000;
    this.authContext = config.authContext;
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

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      config.timeout ?? this.timeout
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
        throw new ApiHttpError(
          errorData?.statusCode ?? response.status,
          errorData?.path ?? endpoint,
          errorData?.timestamp ?? new Date().toISOString(),
          errorData?.message ?? response.statusText
        );
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

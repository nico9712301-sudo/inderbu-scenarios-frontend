import { createServerAuthContext, ServerAuthContext } from './server-auth';
import { ApiError, HttpClient, IHttpClient, RequestConfig } from './types';

export interface ServerHttpClientConfig {
  baseURL: string;
  timeout?: number;
  authContext?: ServerAuthContext;
  headers?: Record<string, string>;
}

// SERVER-ONLY HTTP Client (can use server dependencies)
export class ServerHttpClient implements IHttpClient {
  private baseURL: string;
  private timeout: number;
  private authContext?: ServerAuthContext;
  private defaultHeaders: Record<string, string>;

  constructor(config: ServerHttpClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, '');
    this.timeout = config.timeout || 10000;
    this.authContext = config.authContext;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'NextJS-Server/1.0',
      ...config.headers,
    };
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    if (this.authContext) {
      console.log('HTTP Client: Getting token from auth context...');
      const token = await this.authContext.getToken();
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('HTTP Client: Authorization header set, token length:', token.length);
      } else {
        console.log('HTTP Client: No token received from auth context');
      }
    } else {
      console.log('HTTP Client: No auth context provided');
    }

    return headers;
  }

  private async buildHeaders(customHeaders?: Record<string, string>): Promise<Record<string, string>> {
    const authHeaders = await this.getAuthHeaders();

    return {
      ...this.defaultHeaders,
      ...authHeaders,
      ...customHeaders,
    };
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    options: {
      body?: any;
      config?: RequestConfig;
    } = {}
  ): Promise<T> {
    const { body, config = {} } = options;

    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.buildHeaders(config.headers);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || this.timeout);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: config.signal || controller.signal,
      };

      if (body && method !== 'GET') {
        fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          statusCode: response.status,
          message: 'Network error',
          timestamp: new Date().toISOString(),
          path: endpoint,
        }));

        console.log('[ServerHttpClient] Error response:', {
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
            // Log as warning instead of error and return a more graceful error
            console.warn('HTTP Client: 401 Unauthorized - likely post-logout request, suppressing error for:', endpoint);

            const gracefulError: ApiError = {
              statusCode: 401,
              message: 'Authentication required - session ended',
              timestamp: new Date().toISOString(),
              path: endpoint,
              isPostLogout: true, // Flag to indicate this is post-logout
            };

            throw gracefulError;
          }
        }

        // Backend error structure: { statusCode, message, timestamp, path, details? }
        const apiError: ApiError = {
          statusCode: errorData.statusCode || response.status,
          message: errorData.message || `HTTP ${response.status}`,
          timestamp: errorData.timestamp || new Date().toISOString(),
          path: errorData.path || endpoint,
        };

        // Preserve details (like conflicts) in the error object
        if (errorData.details) {
          (apiError as any).details = errorData.details;
        }
        // Also attach full errorData for debugging
        (apiError as any).errorData = errorData;

        throw apiError;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'AbortError') {
        throw new Error('Request timeout');
      }

      throw error;
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>('GET', endpoint, { config });
  }

  async post<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>('POST', endpoint, { body, config });
  }

  async put<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>('PUT', endpoint, { body, config });
  }

  async patch<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>('PATCH', endpoint, { body, config });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>('DELETE', endpoint, { config });
  }
}

// SERVER-ONLY Factory (can use server dependencies)
export class ServerHttpClientFactory {
  private static readonly SERVER_BASE_URL = process.env.API_URL || 'http://localhost:3001';

  static createServer(authContext?: ServerAuthContext): ServerHttpClient {

    return new ServerHttpClient({
      baseURL: this.SERVER_BASE_URL,
      authContext,
    });
  }

  static createServerWithAuth(): ServerHttpClient {
    const authContext = createServerAuthContext();
    return this.createServer(authContext);
  }

  static createServerSync(authContext?: ServerAuthContext): ServerHttpClient {
    return new ServerHttpClient({
      baseURL: this.SERVER_BASE_URL,
      authContext,
    });
  }
}

// Re-export server auth context creator
export { createServerAuthContext };

import { createServerAuthContext, ServerAuthContext } from './server-auth';
import { ApiError, HttpClient, RequestConfig } from './types';

export interface ServerHttpClientConfig {
  baseURL: string;
  timeout?: number;
  authContext?: ServerAuthContext;
  headers?: Record<string, string>;
}

// SERVER-ONLY HTTP Client (can use server dependencies)
export class ServerHttpClient implements HttpClient {
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

        // Backend error structure: { statusCode, message, timestamp, path }
        const apiError: ApiError = {
          statusCode: errorData.statusCode || response.status,
          message: errorData.message || `HTTP ${response.status}`,
          timestamp: errorData.timestamp || new Date().toISOString(),
          path: errorData.path || endpoint,
        };

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
    // DEBUG LOGS - Server HTTP Client configuration
    console.log('ServerHttpClientFactory DEBUG:', {
      SERVER_BASE_URL: this.SERVER_BASE_URL,
      API_URL_env: process.env.API_URL,
      NODE_ENV: process.env.NODE_ENV,
      hasAuthContext: !!authContext
    });

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

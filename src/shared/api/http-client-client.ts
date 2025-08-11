import { AuthContext, createClientAuthContext } from './auth';
import { ApiError, HttpClient, RequestConfig } from './types';
import { ErrorHandlerComposer } from './error-handler';

export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  authContext?: AuthContext;
  headers?: Record<string, string>;
}

// CLIENT-ONLY HTTP Client (no server dependencies)
export class ClientHttpClient implements HttpClient {
  private baseURL: string;
  private timeout: number;
  private authContext?: AuthContext;
  private defaultHeaders: Record<string, string>;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, '');
    this.timeout = config.timeout || 10000;
    this.authContext = config.authContext;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    console.log('HTTP CLIENT: Getting auth headers...');
    
    if (this.authContext) {
      console.log('HTTP CLIENT: Auth context found, getting token...');
      const token = await this.authContext.getToken();
      
      if (token) {
        console.log(`HTTP CLIENT: Token obtained (length: ${token.length}), adding Authorization header`);
        headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('HTTP CLIENT: No token returned from auth context');
      }
    } else {
      console.log('HTTP CLIENT: No auth context provided');
    }

    console.log('HTTP CLIENT: Final auth headers:', Object.keys(headers));
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
 
    if (body) {
      console.log('HTTP CLIENT: Request body:', typeof body === 'string' ? 'JSON string' : typeof body);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || this.timeout);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: config.signal || controller.signal,
        // CRITICAL: Include cookies for httpOnly authentication
        credentials: 'include',
      };

      // NUEVO: Soporte para Next.js cache tags
      if (config.next) {
        (fetchOptions as any).next = config.next;
      }

      if (body && method !== 'GET') {
        fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      console.log(`HTTP CLIENT: Response status: ${response.status} ${response.statusText}`);
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log('HTTP CLIENT: Request failed, parsing error response...');
        
        const errorData = await response.json().catch(() => ({
          statusCode: response.status,
          message: 'Network error',
          timestamp: new Date().toISOString(),
          path: endpoint,
        }));

        console.log('HTTP CLIENT: Error response data:', errorData);

        // Backend error structure: { statusCode, message, timestamp, path }
        const apiError: ApiError = {
          statusCode: errorData.statusCode || response.status,
          message: errorData.message || `HTTP ${response.status}`,
          timestamp: errorData.timestamp || new Date().toISOString(),
          path: errorData.path || endpoint,
        };

        console.log('HTTP CLIENT: Throwing API error:', apiError);
        throw apiError;
      }

      console.log('HTTP CLIENT: Request successful, parsing response...');
      const data = await response.json();
      console.log('HTTP CLIENT: Response data parsed successfully');
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'AbortError') {
        console.log('HTTP CLIENT: Request timeout');
        throw new Error('Request timeout');
      }

      console.log('HTTP CLIENT: Request failed with error:', error);
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

// CLIENT-ONLY Factory (no server dependencies)
export class ClientHttpClientFactory {
  private static readonly CLIENT_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  static createClient(authContext?: AuthContext): ClientHttpClient {
    return new ClientHttpClient({
      baseURL: this.CLIENT_BASE_URL,
      authContext,
    });
  }

  static createClientWithAuth(): ClientHttpClient {
    const authContext = createClientAuthContext();
    return this.createClient(authContext);
  }

  // NEW: Factory method for httpOnly cookies (no authContext needed)
  static createClientWithCookies(): ClientHttpClient {
    return new ClientHttpClient({
      baseURL: this.CLIENT_BASE_URL,
      // No authContext needed - cookies will be sent automatically with credentials: 'include'
    });
  }
}

// Re-export client auth context creator
export { createClientAuthContext };

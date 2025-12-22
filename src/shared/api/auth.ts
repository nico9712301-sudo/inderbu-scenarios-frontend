export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export class ClientAuthManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static isRefreshing = false;
  private static refreshPromise: Promise<string | null> | null = null;

  // Helper to set cookies from client
  private static setCookie(name: string, value: string, days: number = 7): void {
    if (typeof window === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
  }

  // Helper to delete cookies from client
  private static deleteCookie(name: string): void {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  // Nuevo método con refresh automático
  static async getValidToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem(this.TOKEN_KEY);
    
    if (!token) {
      return null;
    }

    // Verificar si el token está expirado
    if (this.isTokenExpired(token)) {
      return await this.refreshTokenIfNeeded();
    }

    return token;
  }

  // Refresh automático en cliente
  private static async refreshTokenIfNeeded(): Promise<string | null> {
    // Evitar múltiples refreshes simultáneos
    if (this.isRefreshing && this.refreshPromise) {
      return await this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private static async performRefresh(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        this.clearTokens();
        return null;
      }
      
      // Importación dinámica para evitar ciclos
      const { createUserRepository } = await import('@/infrastructure/repositories/auth/auth-user-repository.adapter');
      const { ClientHttpClientFactory } = await import('@/shared/api/http-client-client');
      
      // Crear cliente sin auth para evitar ciclo infinito
      const httpClient = ClientHttpClientFactory.createClient();
      const userRepository = createUserRepository(httpClient);
      
      // Llamar al endpoint de refresh
      const tokens = await userRepository.refreshToken(refreshToken);
      
      // Guardar nuevos tokens
      this.setTokens(tokens.access_token, tokens.refresh_token);
      
      return tokens.access_token;
      
    } catch (error) {
      console.error('ClientAuthManager: Error refreshing token:', error);
      
      // Si falla el refresh, limpiar tokens
      this.clearTokens();
      
      return null;
    }
  }

  // Client-side token management
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    // Store in localStorage for client-side access
    localStorage.setItem(this.TOKEN_KEY, token);
    
    // Also store in cookies for server-side access
    this.setCookie(this.TOKEN_KEY, token, 7); // 7 days
  }

  static setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    // Store in localStorage for client-side access
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    
    // Also store in cookies for server-side access
    this.setCookie(this.REFRESH_TOKEN_KEY, token, 30); // 30 days
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    // Clear from localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    
    // Clear from cookies
    this.deleteCookie(this.TOKEN_KEY);
    this.deleteCookie(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken?: string): void {
    this.setToken(accessToken);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}

// Auth context interface for HttpClient
export interface AuthContext {
  getToken(): Promise<string | null>;
  isServer: boolean;
}

export const createClientAuthContext = (): AuthContext => ({
  getToken: async () => ClientAuthManager.getValidToken(), // Usar el método con refresh
  isServer: false,
});

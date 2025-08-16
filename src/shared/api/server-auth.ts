import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';
import { createUserRepository } from '@/infrastructure/repositories/auth/auth-user-repository.adapter';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import 'server-only';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Server-side token management CON refresh automático
export async function getToken(): Promise<string | null> {
  try {
    console.log('Server Auth: Getting token from cookies...');
    const cookieStore: ReadonlyRequestCookies = await cookies();
    
    // Debug: List all available cookies
    const allCookies = cookieStore.getAll();
    console.log('Available cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    
    const tokenCookie = cookieStore.get(TOKEN_KEY);
    console.log(`Token cookie (${TOKEN_KEY}):`, tokenCookie ? { name: tokenCookie.name, hasValue: !!tokenCookie.value, length: tokenCookie.value?.length } : 'Not found');
    
    const token = tokenCookie?.value || null;
    
    if (token) {
      console.log('Server Auth: Token found, length:', token.length);
      // Check if token is expired
      const isExpired = isTokenExpired(token);
      console.log('Token expired:', isExpired);
      
      if (isExpired) {
        console.log('Server Auth: Token is expired, attempting refresh...');
        return await refreshTokenIfNeeded();
      }
    } else {
      console.log('Server Auth: No token found in cookies');
    }
    
    return token;
  } catch (error) {
    console.error('Server Auth: Error getting token:', error);
    return null;
  }
}

// Nueva función para refresh automático
async function refreshTokenIfNeeded(): Promise<string | null> {
  try {
    console.log('Server Auth: Attempting to refresh token...');
    
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;
    
    if (!refreshToken) {
      console.log('Server Auth: No refresh token available');
      return null;
    }
    
    console.log('Server Auth: Refresh token found, calling refresh endpoint...');
    
    // Crear repository sin auth (para evitar ciclo infinito)
    const httpClient = ClientHttpClientFactory.createClient();
    const userRepository = createUserRepository(httpClient);
    
    // Llamar al endpoint de refresh
    const tokens = await userRepository.refreshToken(refreshToken);
    
    console.log('Server Auth: Token refreshed successfully');
    
    // Guardar nuevos tokens en cookies
    cookieStore.set(TOKEN_KEY, tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    if (tokens.refresh_token) {
      cookieStore.set(REFRESH_TOKEN_KEY, tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
    
    console.log('Server Auth: New tokens saved to cookies');
    return tokens.access_token;
    
  } catch (error) {
    console.error('Server Auth: Error refreshing token:', error);
    
    // Si falla el refresh, limpiar cookies
    try {
      const cookieStore = await cookies();
      cookieStore.delete(TOKEN_KEY);
      cookieStore.delete(REFRESH_TOKEN_KEY);
      console.log('Server Auth: Cleared expired tokens');
    } catch (clearError) {
      console.error('Server Auth: Error clearing tokens:', clearError);
    }
    
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  try {
    const cookieStore: ReadonlyRequestCookies = await cookies();
    cookieStore.set(TOKEN_KEY, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (error) {
    console.error('Failed to set server token:', error);
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_TOKEN_KEY)?.value || null;
  } catch {
    return null;
  }
}

export async function setRefreshToken(token: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(REFRESH_TOKEN_KEY, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch (error) {
    console.error('Failed to set server refresh token:', error);
  }
}

export async function clearTokens(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(TOKEN_KEY);
    cookieStore.delete(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to clear server tokens:', error);
  }
}

export async function setTokens(accessToken: string, refreshToken?: string): Promise<void> {
  await setToken(accessToken);
  if (refreshToken) {
    await setRefreshToken(refreshToken);
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}


// Auth context for server-side usage
export interface ServerAuthContext {
  getToken(): Promise<string | null>;
  isServer: true;
}

export const createServerAuthContext = (): ServerAuthContext => ({
  getToken: () => getToken(),
  isServer: true,
});

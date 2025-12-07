import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createUserRepository } from '@/infrastructure/repositories/auth/auth-user-repository.adapter';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * API route for token refresh
 * Used by middleware to refresh expired tokens
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Refresh token required' },
        { status: 400 }
      );
    }

    // Create repository for token refresh
    const httpClient = ClientHttpClientFactory.createClient();
    const userRepository = createUserRepository(httpClient);

    try {
      // Call backend refresh endpoint
      const tokens = await userRepository.refreshToken(refreshToken);

      if (!tokens.access_token) {
        throw new Error('Invalid refresh token response');
      }

      // Set new tokens in cookies
      const cookieStore = await cookies();

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

      return NextResponse.json({
        success: true,
        data: { tokens }
      });

    } catch (refreshError) {
      // Clear invalid tokens
      const cookieStore = await cookies();
      cookieStore.delete(TOKEN_KEY);
      cookieStore.delete(REFRESH_TOKEN_KEY);

      return NextResponse.json(
        { success: false, error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Error in /api/auth/refresh:', error);

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
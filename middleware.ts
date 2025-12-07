import { NextRequest, NextResponse } from 'next/server';

// Token management functions (duplicated to avoid server-only import issues in middleware)
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// User roles enum (duplicated to avoid import issues in middleware)
enum EUserRole {
  SUPER_ADMIN = 1,
  ADMIN = 2,
  INDEPENDIENTE = 3,
  CLUB_DEPORTIVO = 4,
  ENTRENADOR = 5,
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

function extractUserFromToken(token: string): { id: number; email: string; role: EUserRole } | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.userId || payload.id || payload.sub;

    if (!userId || !payload.email || payload.role === undefined) {
      return null;
    }

    return {
      id: userId,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

function isAdmin(userRole: EUserRole): boolean {
  return userRole === EUserRole.SUPER_ADMIN || userRole === EUserRole.ADMIN;
}

// Protected routes configuration
const PROTECTED_ROUTES = ['/dashboard'];
const ADMIN_ONLY_ROUTES = ['/dashboard'];

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/api/auth', '/auth', '/scenarios', '/reservations'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

function isAdminOnlyRoute(pathname: string): boolean {
  return ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

async function validateSession(request: NextRequest, requireAdmin = false): Promise<{ isValid: boolean; user?: { id: number; email: string; role: EUserRole } }> {
  try {
    // Get token from cookies
    const token = request.cookies.get(TOKEN_KEY)?.value;

    if (!token) {
      return { isValid: false };
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      // Try to refresh token
      const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

      if (!refreshToken) {
        return { isValid: false };
      }

      // Call refresh endpoint
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.tokens?.access_token) {
            // Use the new token for validation
            const newToken = data.data.tokens.access_token;
            const user = extractUserFromToken(newToken);

            if (!user) {
              return { isValid: false };
            }

            if (requireAdmin && !isAdmin(user.role)) {
              return { isValid: false };
            }

            return { isValid: true, user };
          }
        }

        return { isValid: false };
      } catch {
        return { isValid: false };
      }
    }

    // Token is valid, extract user info
    const user = extractUserFromToken(token);

    if (!user) {
      return { isValid: false };
    }

    if (requireAdmin && !isAdmin(user.role)) {
      return { isValid: false };
    }

    return { isValid: true, user };
  } catch {
    return { isValid: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    (pathname.startsWith('/api') && !pathname.startsWith('/api/auth'))
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (isProtectedRoute(pathname)) {
    const requireAdmin = isAdminOnlyRoute(pathname);
    const { isValid, user } = await validateSession(request, requireAdmin);

    if (!isValid) {
      // Redirect to login page with return URL
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Additional admin check for dashboard routes
    if (requireAdmin && user && !isAdmin(user.role)) {
      // Redirect to unauthorized page or home
      const unauthorizedUrl = new URL('/', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
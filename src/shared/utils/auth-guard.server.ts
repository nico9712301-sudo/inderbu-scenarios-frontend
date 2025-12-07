import { redirect } from 'next/navigation';
import { getToken } from '@/shared/api/server-auth';
import { extractUserFromToken, EUserRole } from '@/entities/user/model/types';
import 'server-only';

// Helper function for admin validation in auth guard
function isAdminRole(role: EUserRole): boolean {
  return role === EUserRole.SUPER_ADMIN || role === EUserRole.ADMIN;
}

export interface AuthGuardOptions {
  redirectTo?: string;
  requireAdmin?: boolean;
  allowedRoles?: EUserRole[];
}

export interface AuthValidationResult {
  user: {
    id: number;
    email: string;
    role: EUserRole;
  } | null;
  isAuthenticated: boolean;
  isAuthorized: boolean;
}

/**
 * Server-side authentication guard for Server Components
 * Validates authentication and authorization before Server Components execute
 */
export async function validateServerAuth(options: AuthGuardOptions = {}): Promise<AuthValidationResult> {
  const {
    redirectTo = '/',
    requireAdmin = false,
    allowedRoles = []
  } = options;

  try {
    // Get token from server-side cookies
    const token = await getToken();
    console.log('Auth guard - token exists:', !!token);

    if (!token) {
      console.log('Auth guard - no token, redirecting');
      redirect(redirectTo);
    }

    // Extract user from token
    const user = extractUserFromToken(token);
    console.log('Auth guard - extracted user:', user ? { id: user.id, email: user.email, role: user.role } : null);

    if (!user) {
      console.log('Auth guard - invalid user, redirecting');
      redirect(redirectTo);
    }

    // Check admin requirement
    if (requireAdmin && !isAdminRole(user.role)) {
      console.log('Auth guard - user not admin, role:', user.role, 'isAdmin:', isAdminRole(user.role));
      redirect(redirectTo);
    }

    // Check allowed roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      console.log('Auth guard - user role not in allowed roles:', user.role, 'allowed:', allowedRoles);
      redirect(redirectTo);
    }

    console.log('Auth guard - validation successful, user authorized');
    // Return successful validation result
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      isAuthenticated: true,
      isAuthorized: true,
    };

  } catch (error) {
    // Check if this is a Next.js redirect error (which is normal)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      // Re-throw redirect errors so Next.js can handle them
      throw error;
    }

    // Any other error during validation - redirect
    console.error('Auth validation error:', error);
    redirect(redirectTo);
  }
}

/**
 * Convenience function for admin-only pages
 */
export async function requireAdmin(redirectTo = '/') {
  return await validateServerAuth({
    redirectTo,
    requireAdmin: true,
  });
}

/**
 * Convenience function for authenticated pages
 */
export async function requireAuth(redirectTo = '/') {
  return await validateServerAuth({
    redirectTo,
  });
}

/**
 * Convenience function for role-based access
 */
export async function requireRoles(allowedRoles: EUserRole[], redirectTo = '/') {
  return await validateServerAuth({
    redirectTo,
    allowedRoles,
  });
}
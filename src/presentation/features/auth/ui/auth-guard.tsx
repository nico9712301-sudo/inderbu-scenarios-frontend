'use client';

import { useAuth } from '../model/use-auth';
import { canViewUserReservations } from '@/entities/user/model/types';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  allowedUserIds?: number[];
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true,
  requireAdmin = false,
  allowedUserIds = [],
  redirectTo = '/'
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // If auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // If admin is required but user is not admin
    if (requireAdmin && user && user.role !== 1 && user.role !== 2) {
      router.push(redirectTo);
      return;
    }

    // If specific user access is required
    if (allowedUserIds.length > 0 && user) {
      const hasAccess = allowedUserIds.some(userId => 
        canViewUserReservations(user, userId)
      );
      
      if (!hasAccess) {
        router.push(redirectTo);
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requireAuth, requireAdmin, allowedUserIds, redirectTo, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Verificando acceso...
          </h2>
          <p className="text-gray-600">
            Por favor espera mientras validamos tus permisos.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error de Autenticación
          </h2>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated (and auth is required)
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Acceso Requerido
          </h2>
          <p className="text-gray-600 mb-4">
            Necesitas iniciar sesión para acceder a esta página.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Admin required but user is not admin
  if (requireAdmin && user && user.role !== 1 && user.role !== 2) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 mb-4">
            No tienes permisos de administrador para acceder a esta página.
          </p>
          <button
            onClick={() => router.push(redirectTo)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // User access check failed
  if (allowedUserIds.length > 0 && user) {
    const hasAccess = allowedUserIds.some(userId => 
      canViewUserReservations(user, userId)
    );
    
    if (!hasAccess) {
      return (
        <div className="flex-grow flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 mb-4">
              No tienes permisos para ver estas reservas.
            </p>
            <button
              onClick={() => router.push(redirectTo)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
}

// Specific guard for user reservations
export function UserReservationsGuard({ 
  userId, 
  children 
}: { 
  userId: string | number; 
  children: React.ReactNode; 
}) {
  const userIdNumber = typeof userId === 'string' ? parseInt(userId) : userId;
  
  // Handle invalid userId
  if (isNaN(userIdNumber) || userIdNumber <= 0) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Usuario No Válido
          </h2>
          <p className="text-gray-600 mb-4">
            El ID de usuario proporcionado no es válido.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard
      requireAuth={true}
      allowedUserIds={[userIdNumber]}
      redirectTo="/"
    >
      {children}
    </AuthGuard>
  );
}

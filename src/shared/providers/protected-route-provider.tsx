"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EUserRole } from "@/shared/enums/user-role.enum";
import { useAuth } from "@/presentation/features/auth";
import { getRedirectPath } from "../utils/utils";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";


interface ProtectedRouteProviderProps {
  children: React.ReactNode;
  requiredRole?: EUserRole;
  allowedRoles?: EUserRole[];
  adminOnly?: boolean; // Deprecated: usar requiredRole o allowedRoles
  fallbackPath?: string;
  validateSession?: boolean;
}

export function ProtectedRouteProvider({
  children,
  requiredRole,
  allowedRoles,
  adminOnly = false,
  fallbackPath = "/",
  validateSession = false,  //TODO: cambiar a true cuando se implemente la validación de sesión desde el servidor
}: ProtectedRouteProviderProps) {
  const {
    user,
    isAuthenticated,
    authReady,
    validateCurrentSession,
    isTokenExpired
  } = useAuth();
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(false);
  const [hasCheckedAccess, setHasCheckedAccess] = useState(false);

  // Función memoizada para verificar permisos de rol
  const hasRequiredRole = useCallback((): boolean => {
    if (!user) return false;

    // Backward compatibility con adminOnly
    if (adminOnly) {
      return user.role === EUserRole.SUPER_ADMIN || user.role === EUserRole.ADMIN;
    }

    // Verificar rol específico requerido
    if (requiredRole) {
      return user.role === requiredRole;
    }

    // Verificar si el rol está en la lista de roles permitidos
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles.includes(user.role);
    }

    // Si no se especifica rol, solo verificar autenticación
    return true;
  }, [user, adminOnly, requiredRole, allowedRoles]);

  // Memoizar las condiciones principales
  const accessConditions = useMemo(() => ({
    authReady,
    isAuthenticated,
    hasRole: user ? hasRequiredRole() : false,
    userId: user?.id,
    userRole: user?.role
  }), [authReady, isAuthenticated, user, hasRequiredRole]);

  useEffect(() => {
    // Solo ejecutar si no hemos verificado acceso y auth está listo
    if (!accessConditions.authReady || hasCheckedAccess) return;

    const checkAccess = async () => {

      // Si no está autenticado, redirigir inmediatamente
      if (!accessConditions.isAuthenticated) {
        router.replace(fallbackPath);
        setHasCheckedAccess(true);
        return;
      }

      // Verificar permisos de rol
      if (!accessConditions.hasRole) {
        router.replace(getRedirectPath(accessConditions.userRole));
        setHasCheckedAccess(true);
        return;
      }

      // Validar sesión con el servidor si está habilitado
      if (validateSession && !isValidating) {
        setIsValidating(true);

        try {
          // Verificar si el token está expirado
          if (isTokenExpired()) {
            router.replace(fallbackPath);
            setHasCheckedAccess(true);
            return;
          }

          // Validar sesión con el servidor
          const isValid = await validateCurrentSession();

          if (!isValid) {
            router.replace(fallbackPath);
            setHasCheckedAccess(true);
            return;
          }
        } catch (error) {
          console.error("Error validating session:", error);
          router.replace(fallbackPath);
          setHasCheckedAccess(true);
          return;
        } finally {
          setIsValidating(false);
        }
      }

      console.log("Access granted");
      setHasCheckedAccess(true);
      console.log("Access check completed");
    };

    checkAccess();
  }, [accessConditions, hasCheckedAccess, validateSession, isValidating, router, fallbackPath, validateCurrentSession, isTokenExpired]);

  // Loading states
  if (!accessConditions.authReady || isValidating || !hasCheckedAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-lg text-gray-600">
          {!accessConditions.authReady ? "Verificando acceso..." : "Validando sesión..."}
        </p>
      </div>
    );
  }

  // Si llegamos aquí, el usuario tiene acceso
  return <>{children}</>;
}

// Hook personalizado para verificar permisos en componentes
export function usePermissionGuard() {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (role: EUserRole): boolean => {
    return isAuthenticated && user?.role === role;
  };

  const hasAnyRole = (roles: EUserRole[]): boolean => {
    return isAuthenticated && !!user && roles.includes(user.role);
  };

  const isAdmin = (): boolean => {
    return hasAnyRole([EUserRole.SUPER_ADMIN, EUserRole.ADMIN]);
  };

  const isSuperAdmin = (): boolean => {
    return hasRole(EUserRole.SUPER_ADMIN);
  };

  const isIndependiente = (): boolean => {
    return hasRole(EUserRole.INDEPENDIENTE);
  };

  const isClubDeportivo = (): boolean => {
    return hasRole(EUserRole.CLUB_DEPORTIVO);
  };

  const isEntrenador = (): boolean => {
    return hasRole(EUserRole.ENTRENADOR);
  };

  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
    isIndependiente,
    isClubDeportivo,
    isEntrenador,
    user,
    isAuthenticated,
  };
}

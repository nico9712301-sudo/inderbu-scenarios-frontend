import { useAuth } from "@/presentation/features/auth"; // Updated to new implementation
import { useMemo } from "react";
import { EUserRole } from "../enums/user-role.enum";
import { IPermission } from "../interfaces/permission.interface";

// Configuración de permisos por rol (estática)
const ROLE_PERMISSIONS: Record<EUserRole, IPermission> = {
  [EUserRole.SUPER_ADMIN]: {
    canAccessDashboard: true,
    canViewReservations: true,
    canManageUsers: true,
    canManageScenarios: true,
    canViewAdminPanel: true,
  },
  [EUserRole.ADMIN]: {
    canAccessDashboard: true,
    canViewReservations: false, // ← Admins no ven reservas personales
    canManageUsers: false,
    canManageScenarios: true,
    canViewAdminPanel: true,
  },
  [EUserRole.INDEPENDIENTE]: {
    canAccessDashboard: false,
    canViewReservations: true,
    canManageUsers: false,
    canManageScenarios: false,
    canViewAdminPanel: false,
  },
  [EUserRole.CLUB_DEPORTIVO]: {
    canAccessDashboard: false,
    canViewReservations: true,
    canManageUsers: false,
    canManageScenarios: false,
    canViewAdminPanel: false,
  },
  [EUserRole.ENTRENADOR]: {
    canAccessDashboard: false,
    canViewReservations: true,
    canManageUsers: false,
    canManageScenarios: false,
    canViewAdminPanel: false,
  },
};

// Permisos por defecto (sin autenticación)
const DEFAULT_PERMISSIONS: IPermission = {
  canAccessDashboard: false,
  canViewReservations: false,
  canManageUsers: false,
  canManageScenarios: false,
  canViewAdminPanel: false,
};

export function usePermissions(): IPermission {
  const { user, isAuthenticated } = useAuth();

  // Memoizar los permisos para evitar recálculos innecesarios
  const permissions = useMemo(() => {
    if (!isAuthenticated || !user) {
      return DEFAULT_PERMISSIONS;
    }

    const userPermissions = ROLE_PERMISSIONS[user.role];
    if (!userPermissions) {
      console.warn(` Unknown user role: ${user.role}, using default USER permissions`);
      return ROLE_PERMISSIONS[EUserRole.INDEPENDIENTE]; // Retorna permisos de usuario independiente por defecto
    }

    return userPermissions;
  }, [isAuthenticated, user?.role]); // Solo re-calcula si cambia el rol

  return permissions;
}

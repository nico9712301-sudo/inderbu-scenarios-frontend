import { useAuth } from "@/presentation/features/auth"; // Updated to new implementation
import { EUserRole } from "../enums/user-role.enum";

export function useRoleChecks() {
  const { user, isAuthenticated } = useAuth();

  return {
    // Checks básicos
    isRole: (role: EUserRole) => isAuthenticated && user?.role === role,
    hasAnyRole: (roles: EUserRole[]) =>
      isAuthenticated && user && roles.includes(user.role),
    isAtLeastRole: (minRole: EUserRole) =>
      isAuthenticated && user && user.role <= minRole,

    // Checks específicos de negocio
    isSuperAdmin: () => isAuthenticated && user?.role === EUserRole.SUPER_ADMIN,
    isAdmin: () => isAuthenticated && user?.role === EUserRole.ADMIN,
    isRegularUser: () => isAuthenticated && user?.role === EUserRole.INDEPENDIENTE,
    isClubDeportivo: () => isAuthenticated && user?.role === EUserRole.CLUB_DEPORTIVO,
    isEntrenador: () => isAuthenticated && user?.role === EUserRole.ENTRENADOR,

    // Checks compuestos
    isAnyAdmin: () =>
      isAuthenticated &&
      user &&
      [EUserRole.SUPER_ADMIN, EUserRole.ADMIN].includes(user.role),
    isNonAdmin: () =>
      isAuthenticated &&
      user &&
      ![EUserRole.SUPER_ADMIN, EUserRole.ADMIN].includes(user.role),
  };
}

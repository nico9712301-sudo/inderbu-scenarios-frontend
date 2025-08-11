// Helper functions for roles using new DDD architecture
import { EUserRole } from '@/shared/enums/user-role.enum';

export interface RoleOption {
  id: number;
  name: string;
}

// Convert EUserRole enum to role options for forms
export function getRoleOptions(): RoleOption[] {
  return [
    { id: EUserRole.INDEPENDIENTE, name: 'Independiente' },
    { id: EUserRole.CLUB_DEPORTIVO, name: 'Club Deportivo' },
    { id: EUserRole.ENTRENADOR, name: 'Entrenador' },
    // Note: SUPER_ADMIN and ADMIN are not available for registration
  ];
}

// Get role name by ID
export function getRoleName(roleId: number): string {
  const roles = {
    [EUserRole.SUPER_ADMIN]: 'Super Admin',
    [EUserRole.ADMIN]: 'Admin', 
    [EUserRole.INDEPENDIENTE]: 'Independiente',
    [EUserRole.CLUB_DEPORTIVO]: 'Club Deportivo',
    [EUserRole.ENTRENADOR]: 'Entrenador',
  };
  
  return roles[roleId as EUserRole] || 'Desconocido';
}

// Validate if role ID is allowed for registration
export function isValidRegistrationRole(roleId: number): boolean {
  const allowedRoles = [
    EUserRole.INDEPENDIENTE,
    EUserRole.CLUB_DEPORTIVO, 
    EUserRole.ENTRENADOR
  ];
  
  return allowedRoles.includes(roleId as EUserRole);
}

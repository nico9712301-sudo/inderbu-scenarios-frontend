// Infrastructure: User Domain Transformer
// Bidirectional conversion between backend API types and domain entities

import { UserEntity } from '@/entities/user/domain/UserEntity';
import { createDomainTransformer, IDomainTransformer } from './DomainTransformer';
import { EUserRole } from '@/shared/enums/user-role.enum';

// Backend user type (matching API response)
export interface UserBackend {
  id: number;
  dni?: number;
  firstName?: string;
  lastName?: string;
  first_name?: string;  // Backend inconsistency
  last_name?: string;   // Backend inconsistency
  email: string;
  phone?: string;
  roleId?: number;
  role?: EUserRole | string;  // Can be enum or string from backend
  address?: string;
  neighborhoodId?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // Additional backend fields that might be present
  neighborhood?: {
    id: number;
    name: string;
    commune?: {
      id: number;
      name: string;
      city?: {
        id: number;
        name: string;
      };
    };
  };
}

// Validation functions
function isValidUserBackend(data: any): data is UserBackend {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'number' &&
    data.id > 0 &&
    typeof data.email === 'string' &&
    data.email.includes('@')
  );
}

function isValidUserDomain(entity: any): entity is UserEntity {
  return (
    entity instanceof UserEntity &&
    typeof entity.id === 'number' &&
    entity.id > 0 &&
    typeof entity.email === 'string' &&
    entity.email.includes('@')
  );
}

// Helper function to convert roleId to EUserRole
function getRoleFromId(roleId?: number): EUserRole {
  if (!roleId) return EUserRole.INDEPENDIENTE;
  
  switch (roleId) {
    case 1: return EUserRole.SUPER_ADMIN;
    case 2: return EUserRole.ADMIN;
    case 3: return EUserRole.INDEPENDIENTE;
    case 4: return EUserRole.CLUB_DEPORTIVO;
    case 5: return EUserRole.ENTRENADOR;
    default: return EUserRole.INDEPENDIENTE;
  }
}

// Helper function to normalize role from backend (string or enum)
function normalizeRole(backendRole: any, roleId?: number): EUserRole {
  // If role is provided as enum, use it
  if (typeof backendRole === 'number' && Object.values(EUserRole).includes(backendRole)) {
    return backendRole as EUserRole;
  }
  
  // If role is provided as string, try to match it
  if (typeof backendRole === 'string') {
    const roleUpperCase = backendRole.toUpperCase();
    switch (roleUpperCase) {
      case 'SUPER_ADMIN': return EUserRole.SUPER_ADMIN;
      case 'ADMIN': return EUserRole.ADMIN;
      case 'INDEPENDIENTE': return EUserRole.INDEPENDIENTE;
      case 'CLUB_DEPORTIVO': return EUserRole.CLUB_DEPORTIVO;
      case 'ENTRENADOR': return EUserRole.ENTRENADOR;
      default: break;
    }
  }
  
  // Fallback to roleId conversion
  return getRoleFromId(roleId);
}

// Create the transformer using the generic factory
export const UserTransformer: IDomainTransformer<UserBackend, UserEntity> = 
  createDomainTransformer(
    // Backend → Domain transformation
    (backendData: UserBackend): UserEntity => {
      // Handle backend inconsistencies and normalize data
      const normalizedData = {
        id: backendData.id,
        dni: backendData.dni || 0,
        firstName: backendData.firstName || backendData.first_name || '',
        lastName: backendData.lastName || backendData.last_name || '',
        email: backendData.email,
        phone: backendData.phone || '',
        roleId: backendData.roleId || 3, // Default to INDEPENDIENTE
        role: normalizeRole(backendData.role, backendData.roleId),
        address: backendData.address || '',
        neighborhoodId: backendData.neighborhoodId || 0,
        isActive: backendData.isActive ?? true,
        createdAt: backendData.createdAt,
        updatedAt: backendData.updatedAt,
      };

      return UserEntity.fromApiData(normalizedData);
    },

    // Domain → Backend transformation  
    (domainEntity: UserEntity): UserBackend => {
      return {
        id: domainEntity.id,
        dni: domainEntity.dni,
        firstName: domainEntity.firstName,
        lastName: domainEntity.lastName,
        email: domainEntity.email,
        phone: domainEntity.phone,
        roleId: domainEntity.roleId,
        role: domainEntity.role,
        address: domainEntity.address,
        neighborhoodId: domainEntity.neighborhoodId,
        isActive: domainEntity.isActive,
        createdAt: domainEntity.createdAt,
        updatedAt: domainEntity.updatedAt,
      };
    },

    // Validation functions
    isValidUserBackend,
    isValidUserDomain
  );

// Specialized transformers for collections
export function transformUsersFromBackend(backendUsers: UserBackend[]): UserEntity[] {
  return backendUsers.map(userData => UserTransformer.toDomain(userData));
}

export function transformUsersToBackend(domainUsers: UserEntity[]): UserBackend[] {
  return domainUsers.map(userEntity => UserTransformer.toBackend(userEntity));
}

// Specialized transformer for user with neighborhood details
export function transformUserWithNeighborhoodFromBackend(backendData: UserBackend): UserEntity {
  // The transformer handles the basic user data
  // Neighborhood details are handled separately in the repository layer
  return UserTransformer.toDomain(backendData);
}
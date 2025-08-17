import { UserEntity } from '@/entities/user/domain/UserEntity';
import { createDomainTransformer, IDomainTransformer } from './DomainTransformer';
import { RoleEntity } from '@/entities/role/domain/RoleEntity';

// Backend user type (matching API response)
export interface UserBackend {
  id: number;
  dni?: number;
  firstName?: string;
  lastName?: string;
  first_name?: string; // Backend inconsistency
  last_name?: string;  // Backend inconsistency
  email: string;
  phone?: string;
  address?: string;
  active?: boolean;

  role?: {
    id: number;
    name: string;
    description: string;
    isActive?: boolean;
  };

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

  commune?: {
    id: number;
    name: string;
    city?: { id: number; name: string };
  };

  city?: { id: number; name: string };

  roleId?: number;
  neighborhoodId?: number;

  createdAt?: string;
  updatedAt?: string;
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

// Transformer
export const UserTransformer: IDomainTransformer<UserBackend, UserEntity> =
  createDomainTransformer(
    // Backend → Domain
    (backendData: UserBackend | Partial<UserBackend>): UserEntity => {
      if (
        backendData == null ||
        typeof backendData !== 'object' ||
        typeof backendData.id !== 'number' ||
        typeof backendData.email !== 'string'
      ) {
        throw new Error('Invalid backend data: missing required fields');
      }

      const roleEntity = backendData.role
        ? RoleEntity.fromApiData(backendData.role)
        : new RoleEntity(
            backendData.roleId || 3,
            'Usuario Independiente',
            'Usuario independiente por defecto',
            true
          );

      return UserEntity.fromApiData({
        ...backendData,
        role: roleEntity,
        neighborhood: backendData.neighborhood
          ? {
              id: backendData.neighborhood.id,
              name: backendData.neighborhood.name,
              commune: backendData.neighborhood.commune
                ? {
                    id: backendData.neighborhood.commune.id,
                    name: backendData.neighborhood.commune.name,
                    city: backendData.neighborhood.commune.city
                      ? {
                          id: backendData.neighborhood.commune.city.id,
                          name: backendData.neighborhood.commune.city.name,
                        }
                      : null,
                  }
                : null,
            }
          : null,
        commune: backendData.commune
          ? {
              id: backendData.commune.id,
              name: backendData.commune.name,
              city: backendData.commune.city
                ? {
                    id: backendData.commune.city.id,
                    name: backendData.commune.city.name,
                  }
                : null,
            }
          : null,
        city: backendData.city
          ? {
              id: backendData.city.id,
              name: backendData.city.name,
            }
          : null,
      });
    },

    // Domain → Backend
    (domainEntity: UserEntity | Partial<UserEntity>): UserBackend | Partial<UserBackend> => {
      return {
        id: domainEntity.id!,
        dni: domainEntity.dni,
        firstName: domainEntity.firstName,
        lastName: domainEntity.lastName,
        email: domainEntity.email!,
        phone: domainEntity.phone,
        address: domainEntity.address,
        active: domainEntity.isActive,
        role: domainEntity.role ? domainEntity.role.toApiFormat() : undefined,
        neighborhood: domainEntity.neighborhood,
        commune: domainEntity.commune,
        city: domainEntity.city,
        roleId: domainEntity.roleId,
        neighborhoodId: domainEntity.neighborhoodId,
        createdAt: domainEntity.createdAt,
        updatedAt: domainEntity.updatedAt,
      };
    },

    // Validations
    isValidUserBackend,
    isValidUserDomain
  );

// Helpers for collections
export function transformUsersFromBackend(backendUsers: UserBackend[]): UserEntity[] {
  return backendUsers.map(userData => UserTransformer.toDomain(userData));
}

export function transformUsersToBackend(domainUsers: UserEntity[]): UserBackend[] {
  return domainUsers.map(userEntity => {
    const backendUser = UserTransformer.toBackend(userEntity);
    if (backendUser.id === undefined) {
      throw new Error('UserBackend.id is required');
    }
    return backendUser as UserBackend;
  });
}

// Specialized transformer for user with neighborhood details
export function transformUserWithNeighborhoodFromBackend(backendData: UserBackend): UserEntity {
  // The transformer handles the basic user data
  // Neighborhood details are handled separately in the repository layer
  return UserTransformer.toDomain(backendData);
}
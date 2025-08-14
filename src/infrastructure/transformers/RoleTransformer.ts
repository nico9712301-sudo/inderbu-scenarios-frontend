// Infrastructure: Role Domain Transformer
// Bidirectional conversion between backend API types and domain entities

import { RoleEntity } from '@/entities/role/domain/RoleEntity';
import { createDomainTransformer, IDomainTransformer } from './DomainTransformer';

// Backend role type (matching API response)
export interface RoleBackend {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Validation functions
function isValidRoleBackend(data: any): data is RoleBackend {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'number' &&
    data.id > 0 &&
    typeof data.name === 'string' &&
    data.name.trim() !== ''
  );
}

function isValidRoleDomain(entity: any): entity is RoleEntity {
  return (
    entity instanceof RoleEntity &&
    typeof entity.id === 'number' &&
    entity.id > 0 &&
    typeof entity.name === 'string' &&
    entity.name.trim() !== ''
  );
}

// Create the transformer using the generic factory
export const RoleTransformer: IDomainTransformer<RoleBackend, RoleEntity> = 
  createDomainTransformer(
    // Backend → Domain transformation
    (backendData: RoleBackend): RoleEntity => {
      // Handle backend inconsistencies and normalize data
      const normalizedData = {
        id: backendData.id,
        name: backendData.name,
        description: backendData.description || backendData.name,
        isActive: backendData.isActive ?? true,
        createdAt: backendData.createdAt,
        updatedAt: backendData.updatedAt,
      };

      return RoleEntity.fromApiData(normalizedData);
    },

    // Domain → Backend transformation  
    (domainEntity: RoleEntity): RoleBackend => {
      return {
        id: domainEntity.id,
        name: domainEntity.name,
        description: domainEntity.description,
        isActive: domainEntity.isActive,
        createdAt: domainEntity.createdAt,
        updatedAt: domainEntity.updatedAt,
      };
    },

    // Validation functions
    isValidRoleBackend,
    isValidRoleDomain
  );

// Specialized transformers for collections
export function transformRolesFromBackend(backendRoles: RoleBackend[]): RoleEntity[] {
  return backendRoles.map(roleData => RoleTransformer.toDomain(roleData));
}

export function transformRolesToBackend(domainRoles: RoleEntity[]): RoleBackend[] {
  return domainRoles.map(roleEntity => RoleTransformer.toBackend(roleEntity));
}
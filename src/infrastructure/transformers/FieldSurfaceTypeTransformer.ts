// Field Surface Type Domain Transformer
// Handles bidirectional transformation between FieldSurfaceType (backend) and FieldSurfaceTypeEntity (domain)

import { createDomainTransformer, IDomainTransformer } from './DomainTransformer';
import { FieldSurfaceTypeEntity, FieldSurfaceTypeDomainError } from '@/entities/field-surface-type/domain/FieldSurfaceTypeEntity';
import { FieldSurfaceType } from '@/shared/api/domain-types';

// Validation functions
function isValidFieldSurfaceTypeBackend(data: any): data is FieldSurfaceType {
  return (
    data &&
    typeof data.id === 'number' &&
    typeof data.name === 'string' &&
    data.name.trim().length > 0 &&
    data.id > 0
  );
}

function isValidFieldSurfaceTypeDomain(entity: any): entity is FieldSurfaceTypeEntity {
  return (
    entity &&
    entity instanceof FieldSurfaceTypeEntity &&
    typeof entity.id === 'number' &&
    typeof entity.name === 'string' &&
    entity.id > 0
  );
}

// Transformation functions
function toDomain(backendData: FieldSurfaceType): FieldSurfaceTypeEntity {
  try {
    return FieldSurfaceTypeEntity.fromApiData(backendData);
  } catch (error) {
    throw new FieldSurfaceTypeDomainError(
      `Failed to transform to domain entity: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function toBackend(domainEntity: FieldSurfaceTypeEntity): FieldSurfaceType {
  try {
    return domainEntity.toApiFormat();
  } catch (error) {
    throw new FieldSurfaceTypeDomainError(
      `Failed to transform to backend format: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Create and export the transformer
export const FieldSurfaceTypeTransformer: IDomainTransformer<FieldSurfaceType, FieldSurfaceTypeEntity> = 
  createDomainTransformer(
    toDomain,
    toBackend,
    isValidFieldSurfaceTypeBackend,
    isValidFieldSurfaceTypeDomain
  );

// Export individual functions for direct use if needed
export {
  toDomain as fieldSurfaceTypeToDomain,
  toBackend as fieldSurfaceTypeToBackend,
  isValidFieldSurfaceTypeBackend,
  isValidFieldSurfaceTypeDomain
};
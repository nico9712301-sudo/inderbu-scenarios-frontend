// Activity Area Domain Transformer
// Handles bidirectional transformation between ActivityArea (backend) and ActivityAreaEntity (domain)

import { createDomainTransformer, IDomainTransformer } from './DomainTransformer';
import { ActivityAreaEntity, ActivityAreaDomainError } from '@/entities/activity-area/domain/ActivityAreaEntity';
import { ActivityArea } from '@/shared/api/domain-types';

// Validation functions
function isValidActivityAreaBackend(data: any): data is ActivityArea {
  return (
    data &&
    typeof data.id === 'number' &&
    typeof data.name === 'string' &&
    data.name.trim().length > 0 &&
    data.id > 0
  );
}

function isValidActivityAreaDomain(entity: any): entity is ActivityAreaEntity {
  return (
    entity &&
    entity instanceof ActivityAreaEntity &&
    typeof entity.id === 'number' &&
    typeof entity.name === 'string' &&
    entity.id > 0
  );
}

// Transformation functions
function toDomain(backendData: ActivityArea): ActivityAreaEntity {
  try {
    return ActivityAreaEntity.fromApiData(backendData);
  } catch (error) {
    throw new ActivityAreaDomainError(
      `Failed to transform to domain entity: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function toBackend(domainEntity: ActivityAreaEntity): ActivityArea {
  try {
    return domainEntity.toApiFormat();
  } catch (error) {
    throw new ActivityAreaDomainError(
      `Failed to transform to backend format: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Create and export the transformer
export const ActivityAreaTransformer: IDomainTransformer<ActivityArea, ActivityAreaEntity> = 
  createDomainTransformer(
    toDomain,
    toBackend,
    isValidActivityAreaBackend,
    isValidActivityAreaDomain
  );

// Export individual functions for direct use if needed
export {
  toDomain as activityAreaToDomain,
  toBackend as activityAreaToBackend,
  isValidActivityAreaBackend,
  isValidActivityAreaDomain
};
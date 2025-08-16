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

function isValidActivityAreaDomain(entity: any): entity is ActivityAreaEntity | Partial<ActivityAreaEntity> {
  if (entity instanceof ActivityAreaEntity) return true;
  
  // For partial entities, check it's an object with valid keys
  if (!entity || typeof entity !== 'object') return false;
  
  const validKeys = ['id', 'name', 'active'];
  return Object.keys(entity).every(key => validKeys.includes(key));
}

// Transformation functions
function toDomain(backendData: ActivityArea | Partial<ActivityArea>): ActivityAreaEntity {
  try {
    // For partial data, validate minimum requirements
    if (!isValidActivityAreaBackend(backendData) && !hasMinimumRequiredFields(backendData)) {
      throw new ActivityAreaDomainError(`Invalid backend data for ActivityArea: ${JSON.stringify(backendData)}`);
    }
    return ActivityAreaEntity.fromApiData(backendData as ActivityArea);
  } catch (error) {
    throw new ActivityAreaDomainError(
      `Failed to transform to domain entity: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function toBackend(domainEntity: ActivityAreaEntity | Partial<ActivityAreaEntity>): ActivityArea | Partial<ActivityArea> {
  try {
    if (domainEntity instanceof ActivityAreaEntity) {
      return domainEntity.toApiFormat();
    }
    
    // Handle partial domain entity
    return buildPartialBackend(domainEntity as Partial<ActivityAreaEntity>);
  } catch (error) {
    throw new ActivityAreaDomainError(
      `Failed to transform to backend format: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Helper function to build partial backend object from partial domain entity
function buildPartialBackend(partialEntity: Partial<ActivityAreaEntity>): Partial<ActivityArea> {
  const backendData: Partial<ActivityArea> = {};
  
  if (partialEntity.id !== undefined) backendData.id = partialEntity.id;
  if (partialEntity.name !== undefined) backendData.name = partialEntity.name;
  if (partialEntity.active !== undefined) backendData.active = partialEntity.active;
  
  return backendData;
}

// Helper function to check if partial data has minimum required fields
function hasMinimumRequiredFields(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  const validFields = ['id', 'name', 'active'];
  return Object.keys(data).some(key => validFields.includes(key));
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
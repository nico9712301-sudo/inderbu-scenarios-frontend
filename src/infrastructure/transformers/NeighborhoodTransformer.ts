// Neighborhood Domain Transformer
// Handles bidirectional transformation between Neighborhood (backend) and NeighborhoodEntity (domain)

import { createDomainTransformer, IDomainTransformer } from './DomainTransformer';
import { NeighborhoodEntity, NeighborhoodDomainError } from '@/entities/neighborhood/domain/NeighborhoodEntity';
import { Neighborhood } from '@/services/api';

// Validation functions
function isValidNeighborhoodBackend(data: any): data is Neighborhood {
  return (
    data &&
    typeof data.id === 'number' &&
    typeof data.name === 'string' &&
    data.name.trim().length > 0 &&
    data.id > 0
  );
}

function isValidNeighborhoodDomain(entity: any): entity is NeighborhoodEntity {
  return (
    entity &&
    entity instanceof NeighborhoodEntity &&
    typeof entity.id === 'number' &&
    typeof entity.name === 'string' &&
    entity.id > 0
  );
}

// Transformation functions
function toDomain(backendData: Neighborhood): NeighborhoodEntity {
  try {
    return NeighborhoodEntity.fromApiData(backendData);
  } catch (error) {
    throw new NeighborhoodDomainError(
      `Failed to transform to domain entity: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function toBackend(domainEntity: NeighborhoodEntity): Neighborhood {
  try {
    return domainEntity.toApiFormat();
  } catch (error) {
    throw new NeighborhoodDomainError(
      `Failed to transform to backend format: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Create and export the transformer
export const NeighborhoodTransformer: IDomainTransformer<Neighborhood, NeighborhoodEntity> = 
  createDomainTransformer(
    toDomain,
    toBackend,
    isValidNeighborhoodBackend,
    isValidNeighborhoodDomain
  );

// Export individual functions for direct use if needed
export {
  toDomain as neighborhoodToDomain,
  toBackend as neighborhoodToBackend,
  isValidNeighborhoodBackend,
  isValidNeighborhoodDomain
};
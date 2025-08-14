// Infrastructure: Generic Domain Transformer for Scenarios
import { IDomainTransformer, createDomainTransformer } from './DomainTransformer';
import { ScenarioEntity } from '@/entities/scenario/domain/ScenarioEntity';

// Backend API type (from existing interfaces)
export interface ScenarioBackend {
  id: number;
  name: string;
  address: string;
  description?: string;
  active: boolean;
  neighborhoodId?: number;
  neighborhood?: {
    id: number;
    name: string;
    communeId?: number;
    communeName?: string;
    cityId?: number;
    cityName?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Transform from backend API to domain entity
function toDomain(backendData: ScenarioBackend | ScenarioBackend[]): ScenarioEntity | ScenarioEntity[] {
  if (Array.isArray(backendData)) {
    return backendData.map(item => ScenarioEntity.fromApiData(item));
  }
  return ScenarioEntity.fromApiData(backendData);
}

// Transform from domain entity to backend API format
function toBackend(domainEntity: ScenarioEntity | ScenarioEntity[]): ScenarioBackend | ScenarioBackend[] {
  if (Array.isArray(domainEntity)) {
    return domainEntity.map(entity => entity.toApiFormat());
  }
  return domainEntity.toApiFormat();
}

// Validation functions
function isValidScenarioBackend(data: any): data is ScenarioBackend {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'number' &&
    data.id > 0 &&
    typeof data.name === 'string' &&
    data.name.trim().length > 0 &&
    typeof data.address === 'string' &&
    data.address.trim().length > 0 &&
    typeof data.active === 'boolean'
  );
}

function isValidScenarioDomain(entity: any): entity is ScenarioEntity {
  return entity instanceof ScenarioEntity;
}

// Create and export the transformer
export const ScenarioTransformer: IDomainTransformer<ScenarioBackend, ScenarioEntity> = 
  createDomainTransformer(
    toDomain,
    toBackend,
    isValidScenarioBackend,
    isValidScenarioDomain
  );
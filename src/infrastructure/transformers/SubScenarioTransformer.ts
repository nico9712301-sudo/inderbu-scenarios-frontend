// Infrastructure: Generic Domain Transformer for SubScenarios
import { IDomainTransformer, createDomainTransformer } from './DomainTransformer';
import { SubScenarioEntity } from '@/entities/sub-scenario/domain/SubScenarioEntity';

// Backend API type (from existing interfaces)
export interface SubScenarioBackend {
  id: number;
  name: string;
  hasCost: boolean;
  numberOfSpectators: number;
  numberOfPlayers: number;
  recommendations: string;
  scenario: {
    id: number;
    name: string;
    address: string;
    neighborhood?: { id: number; name: string };
  };
  activityArea: { id: number; name: string };
  fieldSurfaceType: { id: number; name: string };
  imageGallery?: {
    additional: any[];
    count: number;
    featured?: {
      createdAt: string;
      displayOrder: number;
      id: number;
      isFeature: boolean;
      path: string;
      subScenarioId: number;
      url: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

// Transform from backend API to domain entity
function toDomain(backendData: SubScenarioBackend | SubScenarioBackend[]): SubScenarioEntity | SubScenarioEntity[] {
  if (Array.isArray(backendData)) {
    return backendData.map(item => SubScenarioEntity.fromApiData(item));
  }
  return SubScenarioEntity.fromApiData(backendData);
}

// Transform from domain entity to backend API format
function toBackend(domainEntity: SubScenarioEntity | SubScenarioEntity[]): SubScenarioBackend | SubScenarioBackend[] {
  if (Array.isArray(domainEntity)) {
    return domainEntity.map(entity => entity.toApiFormat());
  }
  return domainEntity.toApiFormat();
}

// Validation functions
function isValidSubScenarioBackend(data: any): data is SubScenarioBackend {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'number' &&
    data.id > 0 &&
    typeof data.name === 'string' &&
    data.name.trim().length > 0 &&
    typeof data.hasCost === 'boolean' &&
    data.scenario &&
    typeof data.scenario.id === 'number' &&
    data.scenario.id > 0 &&
    data.activityArea &&
    typeof data.activityArea.id === 'number' &&
    data.activityArea.id > 0 &&
    data.fieldSurfaceType &&
    typeof data.fieldSurfaceType.id === 'number' &&
    data.fieldSurfaceType.id > 0
  );
}

function isValidSubScenarioDomain(entity: any): entity is SubScenarioEntity {
  return entity instanceof SubScenarioEntity;
}

// Create and export the transformer
export const SubScenarioTransformer: IDomainTransformer<SubScenarioBackend, SubScenarioEntity> = 
  createDomainTransformer(
    toDomain,
    toBackend,
    isValidSubScenarioBackend,
    isValidSubScenarioDomain
  );
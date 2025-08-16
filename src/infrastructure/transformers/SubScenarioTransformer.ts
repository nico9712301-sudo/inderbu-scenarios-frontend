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
  active?: boolean;
  scenarioId?: number;
  activityAreaId?: number;
  fieldSurfaceTypeId?: number;
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
function toDomain(backendData: SubScenarioBackend | Partial<SubScenarioBackend>): SubScenarioEntity {
  // Basic validation - just ensure it's an object with an ID
  if (!backendData || typeof backendData !== 'object') {
    throw new Error(`Invalid backend data for SubScenario: not an object`);
  }
  
  if (typeof backendData.id !== 'number' || backendData.id <= 0) {
    throw new Error(`Invalid backend data for SubScenario: missing valid ID`);
  }
  
  // For partial data, ensure we have the minimum required fields
  if (!hasMinimumRequiredFields(backendData)) {
    throw new Error(`Invalid backend data for SubScenario: missing required fields`);
  }
  
  // Let fromApiData handle the detailed validation
  try {
    return SubScenarioEntity.fromApiData(backendData as SubScenarioBackend);
  } catch (error) {
    throw new Error(`Failed to create SubScenario entity: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Transform from domain entity to backend API format
function toBackend(domainEntity: SubScenarioEntity | Partial<SubScenarioEntity>): SubScenarioBackend | Partial<SubScenarioBackend> {
  if (domainEntity instanceof SubScenarioEntity) {
    return domainEntity.toApiFormat();
  }
  
  // Handle partial domain entity
  return buildPartialBackend(domainEntity as Partial<SubScenarioEntity>);
}

// Helper function to build partial backend object from partial domain entity
function buildPartialBackend(partialEntity: Partial<SubScenarioEntity>): Partial<SubScenarioBackend> {
  const backendData: Partial<SubScenarioBackend> = {};
  
  if (partialEntity.id !== undefined) backendData.id = partialEntity.id;
  if (partialEntity.name !== undefined) backendData.name = partialEntity.name;
  if (partialEntity.hasCost !== undefined) backendData.hasCost = partialEntity.hasCost;
  if (partialEntity.numberOfSpectators !== undefined) backendData.numberOfSpectators = partialEntity.numberOfSpectators;
  if (partialEntity.numberOfPlayers !== undefined) backendData.numberOfPlayers = partialEntity.numberOfPlayers;
  if (partialEntity.recommendations !== undefined) backendData.recommendations = partialEntity.recommendations;
  if (partialEntity.active !== undefined) backendData.active = partialEntity.active;
  
  // Handle complex objects - only include if they exist
  if (partialEntity.scenario) {
    backendData.scenario = {
      id: partialEntity.scenario.id || 0,
      name: partialEntity.scenario.name || '',
      address: partialEntity.scenario.address || '',
      neighborhood: partialEntity.scenario.neighborhood
    };
  }
  
  if (partialEntity.activityArea) {
    backendData.activityArea = {
      id: partialEntity.activityArea.id || 0,
      name: partialEntity.activityArea.name || ''
    };
  }
  
  if (partialEntity.fieldSurfaceType) {
    backendData.fieldSurfaceType = {
      id: partialEntity.fieldSurfaceType.id || 0,
      name: partialEntity.fieldSurfaceType.name || ''
    };
  }
  
  if (partialEntity.imageGallery) {
    backendData.imageGallery = partialEntity.imageGallery;
  }
  
  return backendData;
}

// Helper function to check if partial data has minimum required fields
function hasMinimumRequiredFields(data: any): boolean {
  // For updates, we just need the data to be an object with at least one valid field
  if (!data || typeof data !== 'object') return false;
  
  const validFields = [
    'id', 'name', 'hasCost', 'numberOfSpectators', 'numberOfPlayers', 'recommendations', 'active', 
    'scenario', 'activityArea', 'fieldSurfaceType', 'imageGallery', 
    'scenarioId', 'activityAreaId', 'fieldSurfaceTypeId',
    'createdAt', 'updatedAt'
  ];
  return Object.keys(data).some(key => validFields.includes(key));
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

function isValidSubScenarioDomain(entity: any): entity is SubScenarioEntity | Partial<SubScenarioEntity> {
  if (entity instanceof SubScenarioEntity) return true;
  
  // For partial entities, check it's an object with valid keys
  if (!entity || typeof entity !== 'object') return false;
  
  const validKeys = [
    'id', 'name', 'hasCost', 'numberOfSpectators', 'numberOfPlayers', 'recommendations', 'active', 
    'scenario', 'activityArea', 'fieldSurfaceType', 'imageGallery',
    'createdAt', 'updatedAt'
  ];
  return Object.keys(entity).every(key => validKeys.includes(key));
}

// Create and export the transformer
export const SubScenarioTransformer: IDomainTransformer<SubScenarioBackend, SubScenarioEntity> = 
  createDomainTransformer(
    toDomain,
    toBackend,
    isValidSubScenarioBackend,
    isValidSubScenarioDomain
  );
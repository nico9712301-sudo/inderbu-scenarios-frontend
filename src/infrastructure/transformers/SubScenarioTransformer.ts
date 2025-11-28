import {
  IDomainTransformer,
  createDomainTransformer,
} from "./DomainTransformer";
import { SubScenarioEntity } from "@/entities/sub-scenario/domain/SubScenarioEntity";
// Infrastructure: Generic Domain Transformer for SubScenarios

export interface IImageSingle {
  createdAt: string;
  displayOrder: number;
  id: number;
  isFeature: boolean;
  path?: string;
  subScenarioId?: number;
  url: string;
  current: boolean;
}

export interface IImageGallery {
  additional: IImageSingle[];
  count: number;
  featured?: IImageSingle;
}

export interface SubScenarioBackend {
  id?: number; // Ahora es opcional
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
  imageGallery?: IImageGallery;
  createdAt?: string;
  updatedAt?: string;
}

// Backend Update DTO - what the backend actually accepts for updates
export interface SubScenarioUpdateBackend {
  name?: string;
  hasCost?: boolean;
  numberOfSpectators?: number;
  numberOfPlayers?: number;
  recommendations?: string;
  active?: boolean;
  scenarioId?: number;
  activityAreaId?: number;
  fieldSurfaceTypeId?: number;
}

// Transform from backend API to domain entity
function toDomain(
  backendData: SubScenarioBackend | Partial<SubScenarioBackend>,
  options?: { forUpdate?: boolean }
): SubScenarioEntity {
  // DEBUG LOGS - Backend data diagnosis
  console.log('🔄 SubScenarioTransformer.toDomain DEBUG:', {
    backendDataKeys: Object.keys(backendData || {}),
    imageGallery: backendData?.imageGallery,
    featuredImage: backendData?.imageGallery?.featured,
    featuredImageUrl: backendData?.imageGallery?.featured?.url,
    options
  });

  // Basic validation - just ensure it's an object
  if (!backendData || typeof backendData !== "object") {
    throw new Error(`Invalid backend data for SubScenario: not an object`);
  }

  let processedData = backendData;

  // Only remove ID for updates (DDD compliance)
  if (options?.forUpdate === true) {
    const { id, ...dataWithoutId } = backendData;
    processedData = dataWithoutId;
  }

  // For partial data, ensure we have the minimum required fields
  if (!hasMinimumRequiredFields(processedData)) {
    throw new Error(
      `Invalid backend data for SubScenario: missing required fields`
    );
  }

  // Transform data if we have IDs instead of objects
  const transformedData = transformBackendData(processedData);

  // Let fromApiData handle the detailed validation
  try {
    return SubScenarioEntity.fromApiData(transformedData as SubScenarioBackend);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to create SubScenario entity: ${errorMessage}`);
  }
}

// Helper function to transform backend data with IDs to objects
function transformBackendData(backendData: any): any {
  const transformed = { ...backendData };

  // Si tenemos scenarioId pero no scenario, crear objeto mínimo
  if (backendData.scenarioId && !backendData.scenario) {
    transformed.scenario = {
      id: backendData.scenarioId,
      name: "", // Valor por defecto
      address: "", // Valor por defecto
    };
  }

  // Si tenemos activityAreaId pero no activityArea, crear objeto mínimo
  if (backendData.activityAreaId && !backendData.activityArea) {
    transformed.activityArea = {
      id: backendData.activityAreaId,
      name: "", // Valor por defecto
    };
  }

  // Si tenemos fieldSurfaceTypeId pero no fieldSurfaceType, crear objeto mínimo
  if (backendData.fieldSurfaceTypeId && !backendData.fieldSurfaceType) {
    transformed.fieldSurfaceType = {
      id: backendData.fieldSurfaceTypeId,
      name: "", // Valor por defecto
    };
  }

  // Para actualizaciones parciales simples (como toggle status), solo agregar campos mínimos si no existen
  const isPartialUpdate = Object.keys(backendData).length <= 2; // Solo active o pocos campos

  if (!isPartialUpdate) {
    // Ensure required fields have default values if not provided (for complete updates)
    if (transformed.name === undefined) transformed.name = "";
    if (transformed.hasCost === undefined) transformed.hasCost = false;
    if (transformed.numberOfSpectators === undefined)
      transformed.numberOfSpectators = 0;
    if (transformed.numberOfPlayers === undefined)
      transformed.numberOfPlayers = 0;
    if (transformed.recommendations === undefined)
      transformed.recommendations = "";
    if (transformed.active === undefined) transformed.active = true;

    // Para actualizaciones completas, asegurar que tenemos objetos mínimos si no existen
    if (!transformed.scenario) {
      transformed.scenario = { id: 1, name: "", address: "" };
    }
    if (!transformed.activityArea) {
      transformed.activityArea = { id: 1, name: "" };
    }
    if (!transformed.fieldSurfaceType) {
      transformed.fieldSurfaceType = { id: 1, name: "" };
    }
  }

  return transformed;
}

// Transform from domain entity to backend API format
function toBackend(
  domainEntity: SubScenarioEntity | Partial<SubScenarioEntity>
): SubScenarioBackend | SubScenarioUpdateBackend {
  if (domainEntity instanceof SubScenarioEntity) {
    return domainEntity.toApiFormat();
  }

  // Handle partial domain entity - return update DTO
  return buildPartialBackend(domainEntity as Partial<SubScenarioEntity>);
}

// Helper function to build partial backend object from partial domain entity
function buildPartialBackend(
  partialEntity: Partial<SubScenarioEntity>
): SubScenarioUpdateBackend {
  const backendData: SubScenarioUpdateBackend = {};

  // NO incluir ID para actualizaciones - el backend lo rechaza
  // if (partialEntity.id !== undefined) backendData.id = partialEntity.id;

  // Campos básicos
  if (partialEntity.name !== undefined) backendData.name = partialEntity.name;
  if (partialEntity.hasCost !== undefined)
    backendData.hasCost = partialEntity.hasCost;
  if (partialEntity.numberOfSpectators !== undefined)
    backendData.numberOfSpectators = partialEntity.numberOfSpectators;
  if (partialEntity.numberOfPlayers !== undefined)
    backendData.numberOfPlayers = partialEntity.numberOfPlayers;
  if (partialEntity.recommendations !== undefined)
    backendData.recommendations = partialEntity.recommendations;
  if (partialEntity.active !== undefined)
    backendData.active = partialEntity.active;

  // Para actualizaciones, el backend espera IDs directos, no objetos complejos
  if (partialEntity.scenario) {
    backendData.scenarioId = partialEntity.scenario.id;
  }

  if (partialEntity.activityArea) {
    backendData.activityAreaId = partialEntity.activityArea.id;
  }

  if (partialEntity.fieldSurfaceType) {
    backendData.fieldSurfaceTypeId = partialEntity.fieldSurfaceType.id;
  }

  console.log("buildPartialBackend - Input:", partialEntity);
  console.log("buildPartialBackend - Output:", backendData);

  return backendData;
}

// Helper function to check if partial data has minimum required fields
function hasMinimumRequiredFields(data: any): boolean {
  if (!data || typeof data !== "object") return false;

  // Para crear una nueva entidad, necesitamos al menos name
  const hasBasicFields =
    typeof data.name === "string" && data.name.trim().length > 0;

  // Verificar que tenemos los IDs de los objetos relacionados (ya sea como objetos o como IDs)
  const hasScenario =
    data.scenario ||
    (typeof data.scenarioId === "number" && data.scenarioId > 0);
  const hasActivityArea =
    data.activityArea ||
    (typeof data.activityAreaId === "number" && data.activityAreaId > 0);
  const hasFieldSurfaceType =
    data.fieldSurfaceType ||
    (typeof data.fieldSurfaceTypeId === "number" &&
      data.fieldSurfaceTypeId > 0);

  // Si tiene los campos básicos y los objetos relacionados (o sus IDs), es válido para crear
  if (hasBasicFields && hasScenario && hasActivityArea && hasFieldSurfaceType) {
    return true;
  }

  // Para actualizaciones parciales (como toggle de status), cualquier campo válido es suficiente
  const validFields = [
    "id",
    "name",
    "hasCost",
    "numberOfSpectators",
    "numberOfPlayers",
    "recommendations",
    "active",
    "scenario",
    "activityArea",
    "fieldSurfaceType",
    "imageGallery",
    "scenarioId",
    "activityAreaId",
    "fieldSurfaceTypeId",
    "createdAt",
    "updatedAt",
  ];

  // Si tiene al menos un campo válido, es suficiente para actualizaciones parciales
  return Object.keys(data).some((key) => validFields.includes(key));
}

// Validation functions
function isValidSubScenarioBackend(data: any): data is SubScenarioBackend {
  return (
    data &&
    typeof data === "object" &&
    // ID es opcional
    (data.id === undefined || (typeof data.id === "number" && data.id > 0)) &&
    typeof data.name === "string" &&
    data.name.trim().length > 0 &&
    typeof data.hasCost === "boolean" &&
    // Validar que tenemos scenario o scenarioId
    ((data.scenario &&
      typeof data.scenario.id === "number" &&
      data.scenario.id > 0) ||
      (typeof data.scenarioId === "number" && data.scenarioId > 0)) &&
    // Validar que tenemos activityArea o activityAreaId
    ((data.activityArea &&
      typeof data.activityArea.id === "number" &&
      data.activityArea.id > 0) ||
      (typeof data.activityAreaId === "number" && data.activityAreaId > 0)) &&
    // Validar que tenemos fieldSurfaceType o fieldSurfaceTypeId
    ((data.fieldSurfaceType &&
      typeof data.fieldSurfaceType.id === "number" &&
      data.fieldSurfaceType.id > 0) ||
      (typeof data.fieldSurfaceTypeId === "number" &&
        data.fieldSurfaceTypeId > 0))
  );
}

function isValidSubScenarioDomain(
  entity: any
): entity is SubScenarioEntity | Partial<SubScenarioEntity> {
  if (entity instanceof SubScenarioEntity) return true;

  // For partial entities, check it's an object with valid keys
  if (!entity || typeof entity !== "object") return false;

  const validKeys = [
    "id",
    "name",
    "hasCost",
    "numberOfSpectators",
    "numberOfPlayers",
    "recommendations",
    "active",
    "scenario",
    "activityArea",
    "fieldSurfaceType",
    "imageGallery",
    "createdAt",
    "updatedAt",
  ];
  return Object.keys(entity).every((key) => validKeys.includes(key));
}

// Create and export the transformer
export const SubScenarioTransformer: IDomainTransformer<
  SubScenarioBackend,
  SubScenarioEntity
> = createDomainTransformer(
  toDomain,
  toBackend,
  isValidSubScenarioBackend,
  isValidSubScenarioDomain
);

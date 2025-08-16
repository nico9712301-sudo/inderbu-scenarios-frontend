// ScenarioTransformer.ts
import {
  IDomainTransformer,
  createDomainTransformer,
} from "./DomainTransformer";
import { ScenarioEntity } from "@/entities/scenario/domain/ScenarioEntity";

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

function toDomain(
  backendData: ScenarioBackend | Partial<ScenarioBackend>
): ScenarioEntity {
  // Ensure required fields are present for a full ScenarioEntity
  if (!isValidScenarioBackend(backendData)) {
    throw new Error(`Invalid backend data: ${JSON.stringify(backendData)}`);
  }
  return ScenarioEntity.fromApiData(backendData as ScenarioBackend);
}

function toBackend(
  domainEntity: ScenarioEntity | Partial<ScenarioEntity>
): Partial<ScenarioBackend> {
  const backendData: Partial<ScenarioBackend> = {};
  if ("id" in domainEntity && domainEntity.id !== undefined)
    backendData.id = domainEntity.id;
  if ("name" in domainEntity && domainEntity.name !== undefined)
    backendData.name = domainEntity.name;
  if ("address" in domainEntity && domainEntity.address !== undefined)
    backendData.address = domainEntity.address;
  if ("description" in domainEntity && domainEntity.description !== undefined)
    backendData.description = domainEntity.description;
  if ("active" in domainEntity && domainEntity.active !== undefined)
    backendData.active = domainEntity.active;
  if (
    "neighborhoodId" in domainEntity &&
    domainEntity.neighborhoodId !== undefined
  )
    backendData.neighborhoodId = domainEntity.neighborhoodId;
  if ("neighborhood" in domainEntity && domainEntity.neighborhood) {
    backendData.neighborhood = domainEntity.neighborhood.toPlainObject
      ? domainEntity.neighborhood.toPlainObject()
      : domainEntity.neighborhood;
  }
  if ("createdAt" in domainEntity && domainEntity.createdAt) {
    backendData.createdAt = domainEntity.createdAt.toISOString();
  }
  if ("updatedAt" in domainEntity && domainEntity.updatedAt) {
    backendData.updatedAt = domainEntity.updatedAt.toISOString();
  }
  return backendData;
}

function isValidScenarioBackend(data: any): data is ScenarioBackend {
  return (
    data &&
    typeof data === "object" &&
    typeof data.id === "number" &&
    data.id > 0 &&
    typeof data.name === "string" &&
    data.name.trim().length > 0 &&
    typeof data.address === "string" &&
    data.address.trim().length > 0 &&
    typeof data.active === "boolean"
  );
}

function isValidScenarioDomain(
  data: any
): data is ScenarioEntity | Partial<ScenarioEntity> {
  // If it's a ScenarioEntity instance, it's always valid (active or inactive)
  if (data instanceof ScenarioEntity) return true;
  
  // For partial entities or plain objects, validate structure
  if (!data || typeof data !== "object") return false;
  
  // Must have at least one valid property
  if (Object.keys(data).length === 0) return false;
  
  // All keys must be valid scenario properties
  const validKeys = [
    "id",
    "name", 
    "address",
    "description",
    "active",
    "neighborhoodId",
    "neighborhood",
    "createdAt",
    "updatedAt",
  ];
  
  return Object.keys(data).every((key) => validKeys.includes(key));
}

export const ScenarioTransformer: IDomainTransformer<
  ScenarioBackend,
  ScenarioEntity
> = createDomainTransformer(
  toDomain,
  toBackend,
  isValidScenarioBackend,
  isValidScenarioDomain
);

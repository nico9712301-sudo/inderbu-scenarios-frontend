// CityTransformer.ts
import {
  IDomainTransformer,
  createDomainTransformer,
} from "./DomainTransformer";
import { CityEntity } from "@/entities/city/domain/CityEntity";

export interface CityBackend {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

function toDomain(
  backendData: CityBackend | Partial<CityBackend>
): CityEntity {
  // Ensure required fields are present for a full CityEntity
  if (!isValidCityBackend(backendData)) {
    throw new Error(`Invalid backend data: ${JSON.stringify(backendData)}`);
  }
  return CityEntity.fromApiData(backendData as CityBackend);
}

function toBackend(
  domainEntity: CityEntity | Partial<CityEntity>
): Partial<CityBackend> {
  const backendData: Partial<CityBackend> = {};
  if ("id" in domainEntity && domainEntity.id !== undefined)
    backendData.id = domainEntity.id;
  if ("name" in domainEntity && domainEntity.name !== undefined)
    backendData.name = domainEntity.name;
  if ("createdAt" in domainEntity && domainEntity.createdAt) {
    backendData.createdAt = domainEntity.createdAt.toISOString();
  }
  if ("updatedAt" in domainEntity && domainEntity.updatedAt) {
    backendData.updatedAt = domainEntity.updatedAt.toISOString();
  }
  return backendData;
}

function isValidCityBackend(data: any): data is CityBackend {
  return (
    data &&
    typeof data === "object" &&
    typeof data.id === "number" &&
    data.id > 0 &&
    typeof data.name === "string" &&
    data.name.trim().length > 0
  );
}

function isValidCityDomain(
  data: any
): data is CityEntity | Partial<CityEntity> {
  // If it's a CityEntity instance, it's always valid
  if (data instanceof CityEntity) return true;
  
  // For partial entities or plain objects, validate structure
  if (!data || typeof data !== "object") return false;
  
  // Must have at least one valid property
  if (Object.keys(data).length === 0) return false;
  
  // All keys must be valid city properties
  const validKeys = [
    "id",
    "name", 
    "createdAt",
    "updatedAt",
  ];
  
  return Object.keys(data).every((key) => validKeys.includes(key));
}

export const CityTransformer: IDomainTransformer<
  CityBackend,
  CityEntity
> = createDomainTransformer(
  toDomain,
  toBackend,
  isValidCityBackend,
  isValidCityDomain
);
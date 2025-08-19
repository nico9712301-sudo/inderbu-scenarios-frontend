// CommuneTransformer.ts
import {
  IDomainTransformer,
  createDomainTransformer,
} from "./DomainTransformer";
import { CommuneEntity } from "@/entities/commune/domain/CommuneEntity";

export interface CommuneBackend {
  id: number;
  name: string;
  cityId?: number;
  city?: {
    id: number;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

function toDomain(
  backendData: CommuneBackend | Partial<CommuneBackend>
): CommuneEntity {
  // Ensure required fields are present for a full CommuneEntity
  if (!isValidCommuneBackend(backendData)) {
    throw new Error(`Invalid backend data: ${JSON.stringify(backendData)}`);
  }
  return CommuneEntity.fromApiData(backendData as CommuneBackend);
}

function toBackend(
  domainEntity: CommuneEntity | Partial<CommuneEntity>
): Partial<CommuneBackend> {
  const backendData: Partial<CommuneBackend> = {};
  if ("id" in domainEntity && domainEntity.id !== undefined)
    backendData.id = domainEntity.id;
  if ("name" in domainEntity && domainEntity.name !== undefined)
    backendData.name = domainEntity.name;
  if ("cityId" in domainEntity && domainEntity.cityId !== undefined)
    backendData.cityId = domainEntity.cityId;
  if ("city" in domainEntity && domainEntity.city) {
    backendData.city = domainEntity.city;
  }
  if ("createdAt" in domainEntity && domainEntity.createdAt) {
    backendData.createdAt = domainEntity.createdAt.toISOString();
  }
  if ("updatedAt" in domainEntity && domainEntity.updatedAt) {
    backendData.updatedAt = domainEntity.updatedAt.toISOString();
  }
  return backendData;
}

function isValidCommuneBackend(data: any): data is CommuneBackend {
  return (
    data &&
    typeof data === "object" &&
    typeof data.id === "number" &&
    data.id > 0 &&
    typeof data.name === "string" &&
    data.name.trim().length > 0
  );
}

function isValidCommuneDomain(
  data: any
): data is CommuneEntity | Partial<CommuneEntity> {
  // If it's a CommuneEntity instance, it's always valid
  if (data instanceof CommuneEntity) return true;
  
  // For partial entities or plain objects, validate structure
  if (!data || typeof data !== "object") return false;
  
  // Must have at least one valid property
  if (Object.keys(data).length === 0) return false;
  
  // All keys must be valid commune properties
  const validKeys = [
    "id",
    "name", 
    "cityId",
    "city",
    "createdAt",
    "updatedAt",
  ];
  
  return Object.keys(data).every((key) => validKeys.includes(key));
}

export const CommuneTransformer: IDomainTransformer<
  CommuneBackend,
  CommuneEntity
> = createDomainTransformer(
  toDomain,
  toBackend,
  isValidCommuneBackend,
  isValidCommuneDomain
);
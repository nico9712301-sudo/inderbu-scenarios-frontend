import { executeWithDomainError } from "./execute-with-domain-error.wrapper";

import {
  IFieldSurfaceTypeRepository,
  PaginatedFieldSurfaceTypes,
  FieldSurfaceTypeFilters,
} from "@/entities/field-surface-type/domain/IFieldSurfaceTypeRepository";
import {
  FieldSurfaceTypeEntity,
  FieldSurfaceTypeSearchCriteria,
  FieldSurfaceTypeDomainError,
} from "@/entities/field-surface-type/domain/FieldSurfaceTypeEntity";

import { BackendPaginatedResponse } from "@/shared/api/backend-types";
import { FieldSurfaceType } from "@/shared/api/domain-types";
import { IHttpClient } from "@/shared/api/types";

import { FieldSurfaceTypeTransformer } from "@/infrastructure/transformers/FieldSurfaceTypeTransformer";


export class FieldSurfaceTypeRepositoryAdapter
  implements IFieldSurfaceTypeRepository
{
  constructor(private readonly httpClient: IHttpClient) {}

  async getAll(
    filters?: FieldSurfaceTypeFilters
  ): Promise<PaginatedFieldSurfaceTypes> {
    return executeWithDomainError(async () => {
      // Build query params from filters
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.active !== undefined)
        params.append("active", filters.active.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      else params.append("limit", "1000"); // Default high limit

      // Call HTTP client - backend returns BackendPaginatedResponse
      const result = await this.httpClient.get<
        BackendPaginatedResponse<FieldSurfaceType>
      >(`/field-surface-types?${params.toString()}`);

      // Transform backend data to domain entities
      const transformedData: FieldSurfaceTypeEntity[] = result.data.map(
        (fieldSurfaceTypeData) =>
          FieldSurfaceTypeTransformer.toDomain(fieldSurfaceTypeData)
      );

      return {
        data: transformedData,
        meta: result.meta,
      };
    }, "Failed to fetch field surface types");
  }

  async getById(id: number): Promise<FieldSurfaceTypeEntity | null> {
    return executeWithDomainError(async () => {
      const allEntitiesResult = await this.getAll();
      return allEntitiesResult.data.find((entity) => entity.id === id) || null;
    }, `Failed to fetch field surface type ${id}`);
  }

  async create(
    data: Omit<FieldSurfaceTypeEntity, "id">
  ): Promise<FieldSurfaceTypeEntity> {
    return executeWithDomainError(async () => {
      // Transform domain entity to backend format for API call
      const backendData = FieldSurfaceTypeTransformer.toBackend(
        data as FieldSurfaceTypeEntity
      );

      // Call backend API
      const result = await this.httpClient.post<
        BackendPaginatedResponse<FieldSurfaceType>
      >("/field-surface-types", backendData);

      // Transform response back to domain entity
      return FieldSurfaceTypeTransformer.toDomain(result.data[0]);
    }, "Failed to create field surface type");
  }

  async update(
    id: number,
    data: Partial<FieldSurfaceTypeEntity>
  ): Promise<FieldSurfaceTypeEntity> {
    return executeWithDomainError(async () => {
      // Get existing entity and merge with updates
      const existing = await this.getById(id);
      if (!existing) {
        throw new FieldSurfaceTypeDomainError(
          `Field surface type with id ${id} not found`
        );
      }

      // Create updated entity and transform to backend format
      const updatedEntity = { ...existing, ...data } as FieldSurfaceTypeEntity;
      const backendData = FieldSurfaceTypeTransformer.toBackend(updatedEntity);

      // Call backend API
      const result = await this.httpClient.put<
        BackendPaginatedResponse<FieldSurfaceType>
      >(`/field-surface-types/${id}`, backendData);

      // Transform response back to domain entity
      return FieldSurfaceTypeTransformer.toDomain(result.data[0]);
    }, `Failed to update field surface type ${id}`);
  }

  async delete(id: number): Promise<void> {
    return executeWithDomainError(async () => {
      await this.httpClient.delete(`/field-surface-types/${id}`);
    }, `Failed to delete field surface type ${id}`);
  }
}

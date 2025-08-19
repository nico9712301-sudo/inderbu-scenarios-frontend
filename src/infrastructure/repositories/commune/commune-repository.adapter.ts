import {
  CommuneEntity,
  CommuneDomainError,
} from "@/entities/commune/domain/CommuneEntity";
import {
  ICommuneRepository,
  PaginatedCommunes,
  CommuneFilters,
} from "@/entities/commune/infrastructure/commune-repository.port";

import {
  BackendResponse,
  BackendPaginatedResponse,
} from "@/shared/api/backend-types";
import { IHttpClient } from "@/shared/api/types";

import {
  CommuneTransformer,
  CommuneBackend,
} from "@/infrastructure/transformers/CommuneTransformer";
import { executeWithDomainError } from "./execute-with-domain-error.wrapper";

export class CommuneRepository implements ICommuneRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  async getAll(filters?: CommuneFilters): Promise<PaginatedCommunes> {
    return executeWithDomainError(async () => {
      // Build query params from filters
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.cityId)
        params.append("cityId", filters.cityId.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      else params.append("limit", "1000"); // Default high limit
      if (filters?.page) params.append("page", filters.page.toString());

      // Call HTTP client with filters
      const result: BackendPaginatedResponse<CommuneBackend> =
        await this.httpClient.get<BackendPaginatedResponse<CommuneBackend>>(
          `/communes?${params.toString()}`
        );

      // Transform backend data to domain entities
      const transformedData: CommuneEntity[] = result.data.map(
        (communeData) =>
          CommuneTransformer.toDomain(communeData) as CommuneEntity
      );

      return {
        data: transformedData,
        meta: result.meta,
      };
    }, 'Failed to fetch communes');
  }

  async getAllSimple(): Promise<CommuneEntity[]> {
    return executeWithDomainError(async () => {
      // Call HTTP client without pagination for select options
      const result: BackendResponse<CommuneBackend[]> =
        await this.httpClient.get<BackendResponse<CommuneBackend[]>>("/communes");

      // Transform backend data to domain entities
      const transformedData: CommuneEntity[] = result.data.map(
        (communeData) =>
          CommuneTransformer.toDomain(communeData) as CommuneEntity
      );

      return transformedData;
    }, 'Failed to fetch communes (simple)');
  }

  async getById(id: number): Promise<CommuneEntity | null> {
    return executeWithDomainError(async () => {
      const result = await this.httpClient.get<CommuneBackend>(
        `/communes/${id}`
      );

      // Transform backend data to domain entity
      return CommuneTransformer.toDomain(result) as CommuneEntity;
    }, `Failed to fetch commune ${id}`);
  }

  async create(data: Omit<CommuneEntity, "id">): Promise<CommuneEntity> {
    return executeWithDomainError(async () => {
      console.log("Creating commune with data:", data);
      // Transform domain entity to backend format for API call
      const backendData = CommuneTransformer.toBackend(data as CommuneEntity);

      // Call backend API
      const result = await this.httpClient.post<
        BackendResponse<CommuneBackend>
      >("/communes", backendData);

      // Transform response back to domain entity
      return CommuneTransformer.toDomain(result.data) as CommuneEntity;
    }, 'Failed to create commune');
  }

  async update(
    id: number,
    data: Partial<CommuneEntity>
  ): Promise<CommuneEntity> {
    return executeWithDomainError(async () => {
      const backendData: CommuneBackend | Partial<CommuneBackend> =
        CommuneTransformer.toBackend(data);
      const result: BackendResponse<CommuneBackend> =
        await this.httpClient.put<BackendResponse<CommuneBackend>>(
          `/communes/${id}`,
          backendData
        );
      return CommuneTransformer.toDomain(result.data) as CommuneEntity;
    }, `Failed to update commune ${id}`);
  }

  async delete(id: number): Promise<void> {
    return executeWithDomainError(async () => {
      await this.httpClient.delete(`/communes/${id}`);
    }, `Failed to delete commune ${id}`);
  }
}
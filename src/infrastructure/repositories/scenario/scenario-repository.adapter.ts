import {
  ScenarioEntity,
  ScenarioDomainError,
} from "@/entities/scenario/domain/ScenarioEntity";
import {
  IScenarioRepository,
  PaginatedScenarios,
  ScenarioFilters,
} from "@/entities/scenario/infrastructure/scenario-repository.port";

import {
  BackendResponse,
  BackendPaginatedResponse,
} from "@/shared/api/backend-types";
import { IHttpClient } from "@/shared/api/types";

import {
  ScenarioTransformer,
  ScenarioBackend,
} from "@/infrastructure/transformers/ScenarioTransformer";
import { ApiHttpError } from "@/shared/api/http-client-client";
import { executeWithDomainError } from "./execute-with-domain-error.wrapper";

export class ScenarioRepository implements IScenarioRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  async getAll(filters?: ScenarioFilters): Promise<PaginatedScenarios> {
    return executeWithDomainError(async () => {
      // Build query params from filters
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.neighborhoodId)
        params.append("neighborhoodId", filters.neighborhoodId.toString());
      if (filters?.active !== undefined)
        params.append("active", filters.active.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      else params.append("limit", "1000"); // Default high limit
      if (filters?.page) params.append("page", filters.page.toString());

      // Call HTTP client with filters
      const result: BackendPaginatedResponse<ScenarioBackend> =
        await this.httpClient.get<BackendPaginatedResponse<ScenarioBackend>>(
          `/scenarios?${params.toString()}`
        );

      // Transform backend data to domain entities
      const transformedData: ScenarioEntity[] = result.data.map(
        (scenarioData) =>
          ScenarioTransformer.toDomain(scenarioData) as ScenarioEntity
      );

      return {
        data: transformedData,
        meta: result.meta,
      };
    }, 'Failed to fetch scenarios');
  }

  async getById(id: number): Promise<ScenarioEntity | null> {
    return executeWithDomainError(async () => {
      const result = await this.httpClient.get<ScenarioBackend>(
        `/scenarios/${id}`
      );

      // Transform backend data to domain entity
      return ScenarioTransformer.toDomain(result) as ScenarioEntity;
    }, `Failed to fetch scenario ${id}`);
  }

  async create(data: Omit<ScenarioEntity, "id">): Promise<ScenarioEntity> {
    return executeWithDomainError(async () => {
      // Transform domain entity to backend format for API call
      const backendData = ScenarioTransformer.toBackend(data as ScenarioEntity);

      // Call backend API
      const result = await this.httpClient.post<
        BackendResponse<ScenarioBackend>
      >("/scenarios", backendData);

      // Transform response back to domain entity
      return ScenarioTransformer.toDomain(result.data) as ScenarioEntity;
    }, 'Failed to create scenario');
  }

  async update(
    id: number,
    data: Partial<ScenarioEntity>
  ): Promise<ScenarioEntity> {
    return executeWithDomainError(async () => {
      const backendData: ScenarioBackend | Partial<ScenarioBackend> =
        ScenarioTransformer.toBackend(data);
      const result: BackendResponse<ScenarioBackend> =
        await this.httpClient.put<BackendResponse<ScenarioBackend>>(
          `/scenarios/${id}`,
          backendData
        );
      return ScenarioTransformer.toDomain(result.data) as ScenarioEntity;
    }, `Failed to update scenario ${id}`);
  }

  async delete(id: number): Promise<void> {
    return executeWithDomainError(async () => {
      await this.httpClient.delete(`/scenarios/${id}`);
    }, `Failed to delete scenario ${id}`);
  }
}

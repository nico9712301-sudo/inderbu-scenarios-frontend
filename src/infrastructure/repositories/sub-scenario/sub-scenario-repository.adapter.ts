import { executeWithDomainError } from "./execute-with-domain-error.wrapper";

import {
  ISubScenarioRepository,
  SubScenariosFilters,
  SubScenarioStatsFilters,
  SubScenarioStats,
} from "@/entities/sub-scenario/infrastructure/ISubScenarioRepository";
import { PaginatedSubScenarios } from "@/entities/sub-scenario/domain/sub-scenario.domain";
import { SubScenarioEntity } from "@/entities/sub-scenario/domain/SubScenarioEntity";

import {
  SubScenarioTransformer,
  SubScenarioBackend,
} from "@/infrastructure/transformers/SubScenarioTransformer";

import {
  BackendPaginatedResponse,
  BackendResponse,
} from "@/shared/api/backend-types";
import { IHttpClient } from "@/shared/api/types";

export class SubScenarioRepository implements ISubScenarioRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  async getAll(filters?: SubScenariosFilters): Promise<PaginatedSubScenarios> {
    return executeWithDomainError(async () => {
      // Build query params
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.search) params.append("search", filters.search);
      if (filters?.scenarioId)
        params.append("scenarioId", filters.scenarioId.toString());
      if (filters?.activityAreaId)
        params.append("activityAreaId", filters.activityAreaId.toString());
      if (filters?.neighborhoodId)
        params.append("neighborhoodId", filters.neighborhoodId.toString());
      if (filters?.active !== undefined)
        params.append("active", filters.active.toString());

      // Call HTTP client - backend returns BackendPaginatedResponse
      const result = await this.httpClient.get<
        BackendPaginatedResponse<SubScenarioBackend>
      >(`/sub-scenarios?${params.toString()}`);

      // Transform backend data to domain entities
      const transformedData: SubScenarioEntity[] = result.data.map(
        (subScenarioData) => SubScenarioTransformer.toDomain(subScenarioData)
      );

      return {
        data: transformedData,
        meta: result.meta,
      };
    }, "Failed to fetch sub-scenarios");
  }

  async create(
    data: Omit<SubScenarioEntity, "id"> & { images?: any[] }
  ): Promise<SubScenarioEntity> {
    return executeWithDomainError(async () => {
      // Transform domain entity to backend format for API call
      const backendData = SubScenarioTransformer.toBackend(
        data as SubScenarioEntity
      );

      // Direct API call - backend returns wrapped response
      const result = await this.httpClient.post<
        BackendResponse<SubScenarioBackend>
      >("/sub-scenarios", backendData);

      // Extract data and transform to domain entity
      return SubScenarioTransformer.toDomain(result.data);
    }, "Failed to create sub-scenario");
  }

  async update(
    id: number,
    data: Partial<SubScenarioEntity>
  ): Promise<SubScenarioEntity> {
    return executeWithDomainError(async () => {
      // Transform domain entity to backend format for API call - now handles Partial<T>
      const backendData = SubScenarioTransformer.toBackend(data);

      // Direct API call - backend returns wrapped response
      const result = await this.httpClient.put<
        BackendResponse<SubScenarioBackend>
      >(`/sub-scenarios/${id}`, backendData);

      // Extract data and transform to domain entity
      return SubScenarioTransformer.toDomain(result.data);
    }, `Failed to update sub-scenario ${id}`);
  }

  async updateActiveStatus(
    id: number,
    active: boolean
  ): Promise<SubScenarioEntity> {
    return executeWithDomainError(async () => {
      // Input validation
      if (id <= 0) {
        throw new Error("Sub-scenario ID must be a positive number");
      }

      // Get current entity
      const currentEntity = await this.getById(id);
      if (!currentEntity) {
        throw new Error(`Sub-scenario with ID ${id} not found`);
      }

      // Use domain method to update active status
      currentEntity.updateActiveStatus(active);

      // Transform only the active field for backend update
      const backendData = { active: currentEntity.active };

      // Direct API call - backend returns wrapped response
      const result = await this.httpClient.put<
        BackendResponse<SubScenarioBackend>
      >(`/sub-scenarios/${id}`, backendData);

      // Extract data and transform to domain entity
      return SubScenarioTransformer.toDomain(result.data);
    }, `Failed to update sub-scenario active status ${id}`);
  }

  async getById(id: number): Promise<SubScenarioEntity | null> {
    return executeWithDomainError(async () => {
      // Input validation
      if (id <= 0) {
        throw new Error("Sub-scenario ID must be a positive number");
      } // Direct API call - backend returns wrapped response
      const result = await this.httpClient.get<
        BackendResponse<SubScenarioBackend>
      >(`/sub-scenarios/${id}`);

      // Extract data and transform to domain entity
      return SubScenarioTransformer.toDomain(result.data);
    }, `Failed to fetch sub-scenario ${id}`);
  }

  async delete(id: number): Promise<void> {
    return executeWithDomainError(async () => {
      // Input validation
      if (id <= 0) {
        throw new Error("Sub-scenario ID must be a positive number");
      }

      // Make API request (soft delete - set isActive to false)
      await this.httpClient.delete(`/sub-scenarios/${id}`);
    }, `Failed to delete sub-scenario ${id}`);
  }

  async getStats(filters?: SubScenarioStatsFilters): Promise<SubScenarioStats> {
    return executeWithDomainError(async () => {
      // Build query params
      const params = new URLSearchParams();
      if (filters?.active !== undefined) {
        params.append("active", filters.active.toString());
      }

      // Call HTTP client - backend returns { statusCode, message, data: { count: number } }
      const result = await this.httpClient.get<BackendResponse<{ count: number }>>(
        `/sub-scenarios/stats?${params.toString()}`
      );

      // Return the stats directly from the backend response
      return {
        count: result.data.count,
      };
    }, "Failed to fetch sub-scenario stats");
  }
}

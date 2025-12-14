import { executeWithDomainError } from "./execute-with-domain-error.wrapper";
import { ISubScenarioPriceRepository } from "@/entities/billing/infrastructure/ISubScenarioPriceRepository";
import { 
  SubScenarioPriceEntity, 
  CreateSubScenarioPriceData, 
  UpdateSubScenarioPriceData,
  SubScenarioPriceTransformer 
} from "@/entities/billing/domain/SubScenarioPriceEntity";
import { IHttpClient } from "@/shared/api/types";
import { BackendResponse } from "@/shared/api/backend-types";

export class SubScenarioPriceRepository implements ISubScenarioPriceRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  async create(data: CreateSubScenarioPriceData): Promise<SubScenarioPriceEntity> {
    return executeWithDomainError(async () => {
      const requestData = SubScenarioPriceTransformer.toCreateRequest(data);
      const result = await this.httpClient.post<BackendResponse<any>>(
        "/api/sub-scenario-pricing",
        requestData
      );

      return SubScenarioPriceTransformer.fromApiData(result.data);
    }, "Failed to create sub-scenario price");
  }

  async getBySubScenarioId(subScenarioId: number): Promise<SubScenarioPriceEntity | null> {
    return executeWithDomainError(async () => {
      try {
        const result = await this.httpClient.get<BackendResponse<any>>(
          `/api/sub-scenario-pricing/sub-scenario/${subScenarioId}`
        );

        return result.data ? SubScenarioPriceTransformer.fromApiData(result.data) : null;
      } catch (error: any) {
        // 404 means no price exists, return null
        if (error?.statusCode === 404) {
          return null;
        }
        throw error;
      }
    }, "Failed to get sub-scenario price");
  }

  async updateBySubScenarioId(
    subScenarioId: number, 
    data: UpdateSubScenarioPriceData
  ): Promise<SubScenarioPriceEntity> {
    return executeWithDomainError(async () => {
      const requestData = SubScenarioPriceTransformer.toUpdateRequest(data);
      const result = await this.httpClient.put<BackendResponse<any>>(
        `/api/sub-scenario-pricing/sub-scenario/${subScenarioId}`,
        requestData
      );

      return SubScenarioPriceTransformer.fromApiData(result.data);
    }, "Failed to update sub-scenario price");
  }

  async deleteBySubScenarioId(subScenarioId: number): Promise<void> {
    return executeWithDomainError(async () => {
      await this.httpClient.delete(
        `/api/sub-scenario-pricing/sub-scenario/${subScenarioId}`
      );
    }, "Failed to delete sub-scenario price");
  }
}

export const createSubScenarioPriceRepository = (httpClient: IHttpClient): ISubScenarioPriceRepository => {
  return new SubScenarioPriceRepository(httpClient);
};

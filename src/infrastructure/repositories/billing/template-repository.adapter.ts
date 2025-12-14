import { executeWithDomainError } from "./execute-with-domain-error.wrapper";
import { ITemplateRepository } from "@/entities/billing/infrastructure/ITemplateRepository";
import { TemplateEntity, CreateTemplateData, UpdateTemplateData, TemplateType } from "@/entities/billing/domain/TemplateEntity";
import { IHttpClient } from "@/shared/api/types";
import { BackendResponse } from "@/shared/api/backend-types";

export class TemplateRepository implements ITemplateRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  async getByType(type: TemplateType): Promise<TemplateEntity[]> {
    return executeWithDomainError(async () => {
      const result = await this.httpClient.get<BackendResponse<TemplateEntity[]>>(
        `/api/templates/type/${type}`
      );

      const templates = result.data || [];
      return Array.isArray(templates)
        ? templates.map((item) => TemplateEntity.fromApiData(item))
        : [];
    }, "Failed to get templates by type");
  }

  async getActiveReceiptTemplates(searchTerm?: string): Promise<TemplateEntity[]> {
    return executeWithDomainError(async () => {
      const url = searchTerm && searchTerm.trim().length > 0
        ? `/api/templates/receipts/active?search=${encodeURIComponent(searchTerm.trim())}`
        : "/api/templates/receipts/active";
      
      const result = await this.httpClient.get<BackendResponse<TemplateEntity[]>>(url);

      const templates = result.data || [];
      return Array.isArray(templates)
        ? templates.map((item) => TemplateEntity.fromApiData(item))
        : [];
    }, "Failed to get active receipt templates");
  }

  async getById(id: number): Promise<TemplateEntity | null> {
    return executeWithDomainError(async () => {
      const result = await this.httpClient.get<BackendResponse<any>>(
        `/api/templates/${id}`
      );

      return result.data ? TemplateEntity.fromApiData(result.data) : null;
    }, "Failed to get template by id");
  }

  async create(data: CreateTemplateData): Promise<TemplateEntity> {
    return executeWithDomainError(async () => {
      const result = await this.httpClient.post<BackendResponse<any>>(
        "/api/templates",
        {
          name: data.name,
          type: data.type,
          content: data.content,
          description: data.description,
          active: data.active ?? true,
        }
      );

      return TemplateEntity.fromApiData(result.data);
    }, "Failed to create template");
  }

  async update(id: number, data: UpdateTemplateData): Promise<TemplateEntity> {
    return executeWithDomainError(async () => {
      const result = await this.httpClient.put<BackendResponse<any>>(
        `/api/templates/${id}`,
        {
          name: data.name,
          content: data.content,
          description: data.description,
          active: data.active,
        }
      );

      return TemplateEntity.fromApiData(result.data);
    }, "Failed to update template");
  }

  async delete(id: number): Promise<void> {
    return executeWithDomainError(async () => {
      await this.httpClient.delete(`/api/templates/${id}`);
    }, "Failed to delete template");
  }
}

export const createTemplateRepository = (httpClient: IHttpClient): ITemplateRepository => {
  return new TemplateRepository(httpClient);
};

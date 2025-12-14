import { TemplateEntity, CreateTemplateData, UpdateTemplateData, TemplateType } from '../domain/TemplateEntity';

export interface ITemplateRepository {
  getByType(type: TemplateType): Promise<TemplateEntity[]>;
  getActiveReceiptTemplates(searchTerm?: string): Promise<TemplateEntity[]>;
  getById(id: number): Promise<TemplateEntity | null>;
  create(data: CreateTemplateData): Promise<TemplateEntity>;
  update(id: number, data: UpdateTemplateData): Promise<TemplateEntity>;
  delete(id: number): Promise<void>;
}

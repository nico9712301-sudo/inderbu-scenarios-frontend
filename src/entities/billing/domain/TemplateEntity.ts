export type TemplateType = 'receipt' | 'invoice' | 'email';

export interface TemplatePlainObject {
  id: number;
  name: string;
  type: TemplateType;
  content: string; // JSON string
  description?: string;
  isActive: boolean;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateData {
  name: string;
  type: TemplateType;
  content: string;
  description?: string;
  active?: boolean;
}

export interface UpdateTemplateData {
  name?: string;
  content?: string;
  description?: string;
  active?: boolean;
}

export class TemplateEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly type: TemplateType,
    public readonly content: string,
    public readonly description: string | undefined,
    public readonly isActive: boolean,
    public readonly createdBy: number | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static fromApiData(apiData: any): TemplateEntity {
    return new TemplateEntity(
      apiData.id,
      apiData.name,
      apiData.type,
      apiData.content,
      apiData.description,
      apiData.isActive,
      apiData.createdBy,
      new Date(apiData.createdAt),
      new Date(apiData.updatedAt)
    );
  }

  toPlainObject(): TemplatePlainObject {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      content: this.content,
      description: this.description,
      isActive: this.isActive,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

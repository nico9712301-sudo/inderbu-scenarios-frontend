export interface ReceiptPlainObject {
  id: number;
  reservationId: number;
  templateId: number;
  templateName?: string;
  templateContent?: string;
  variablesValues: {
    hourlyPrice: number;
    totalCost: number;
  };
  generatedAt: Date;
  sentAt?: Date;
  sentToEmail?: string;
  isGenerated: boolean;
  isSent: boolean;
}

export interface GenerateReceiptData {
  reservationId: number;
  templateId: number;
  customerEmail?: string;
  hourlyPrice?: number;
  totalCost?: number;
}

export interface SendReceiptData {
  receiptId: number;
  email: string;
}

export class ReceiptEntity {
  constructor(
    public readonly id: number,
    public readonly reservationId: number,
    public readonly templateId: number,
    public readonly templateName: string | undefined,
    public readonly templateContent: string | undefined,
    public readonly variablesValues: {
      hourlyPrice: number;
      totalCost: number;
    },
    public readonly generatedAt: Date,
    public readonly sentAt: Date | undefined,
    public readonly sentToEmail: string | undefined,
    public readonly isGenerated: boolean,
    public readonly isSent: boolean
  ) {}

  static fromApiData(apiData: any): ReceiptEntity {
    return new ReceiptEntity(
      apiData.id,
      apiData.reservationId,
      apiData.templateId,
      apiData.templateName,
      apiData.templateContent,
      apiData.variablesValues || { hourlyPrice: 0, totalCost: 0 },
      new Date(apiData.generatedAt),
      apiData.sentAt ? new Date(apiData.sentAt) : undefined,
      apiData.sentToEmail,
      apiData.isGenerated,
      apiData.isSent
    );
  }

  toPlainObject(): ReceiptPlainObject {
    return {
      id: this.id,
      reservationId: this.reservationId,
      templateId: this.templateId,
      templateName: this.templateName,
      templateContent: this.templateContent,
      variablesValues: this.variablesValues,
      generatedAt: this.generatedAt,
      sentAt: this.sentAt,
      sentToEmail: this.sentToEmail,
      isGenerated: this.isGenerated,
      isSent: this.isSent,
    };
  }
}

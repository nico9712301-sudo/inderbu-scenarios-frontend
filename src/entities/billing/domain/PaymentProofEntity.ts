export interface PaymentProofPlainObject {
  id: number;
  reservationId: number;
  fileUrl: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: number;
  createdAt: Date;
  uploadedByUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role?: {
      id: number;
      name: string;
    } | null;
  };
}

export interface UploadPaymentProofData {
  file: File;
  reservationId: number;
  uploadedByUserId: number;
}

export class PaymentProofEntity {
  constructor(
    public readonly id: number,
    public readonly reservationId: number,
    public readonly fileUrl: string,
    public readonly originalFileName: string,
    public readonly mimeType: string,
    public readonly fileSize: number,
    public readonly uploadedBy: number,
    public readonly createdAt: Date
  ) {}

  static fromApiData(apiData: any): PaymentProofEntity {
    const entity = new PaymentProofEntity(
      apiData.id,
      apiData.reservationId,
      apiData.fileUrl,
      apiData.originalFileName,
      apiData.mimeType,
      apiData.fileSize,
      apiData.uploadedBy,
      new Date(apiData.createdAt)
    );
    
    // Preserve user information if available
    if (apiData.uploadedByUser) {
      (entity as any).uploadedByUser = apiData.uploadedByUser;
    }
    
    return entity;
  }

  toPlainObject(): PaymentProofPlainObject {
    const plain: PaymentProofPlainObject = {
      id: this.id,
      reservationId: this.reservationId,
      fileUrl: this.fileUrl,
      originalFileName: this.originalFileName,
      mimeType: this.mimeType,
      fileSize: this.fileSize,
      uploadedBy: this.uploadedBy,
      createdAt: this.createdAt,
    };
    
    // Include user information if available
    if ((this as any).uploadedByUser) {
      plain.uploadedByUser = (this as any).uploadedByUser;
    }
    
    return plain;
  }
}

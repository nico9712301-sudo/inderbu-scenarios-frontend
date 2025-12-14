export interface PaymentProofPlainObject {
  id: number;
  reservationId: number;
  fileUrl: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: number;
  createdAt: Date;
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
    return new PaymentProofEntity(
      apiData.id,
      apiData.reservationId,
      apiData.fileUrl,
      apiData.originalFileName,
      apiData.mimeType,
      apiData.fileSize,
      apiData.uploadedBy,
      new Date(apiData.createdAt)
    );
  }

  toPlainObject(): PaymentProofPlainObject {
    return {
      id: this.id,
      reservationId: this.reservationId,
      fileUrl: this.fileUrl,
      originalFileName: this.originalFileName,
      mimeType: this.mimeType,
      fileSize: this.fileSize,
      uploadedBy: this.uploadedBy,
      createdAt: this.createdAt,
    };
  }
}

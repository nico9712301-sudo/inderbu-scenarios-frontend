import { IPaymentProofRepository } from "@/entities/billing/infrastructure/IPaymentProofRepository";
import { PaymentProofEntity, UploadPaymentProofData } from "@/entities/billing/domain/PaymentProofEntity";

export class UploadPaymentProofUseCase {
  constructor(
    private paymentProofRepository: IPaymentProofRepository
  ) {}

  async execute(data: UploadPaymentProofData): Promise<PaymentProofEntity> {
    // Input validation
    if (!data.file) {
      throw new Error('File is required');
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(data.file.type)) {
      throw new Error('File must be PDF, JPG, JPEG, or PNG');
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (data.file.size > maxSize) {
      throw new Error('File size cannot exceed 10MB');
    }

    if (!data.reservationId || data.reservationId <= 0) {
      throw new Error('Valid reservation ID is required');
    }

    if (!data.uploadedByUserId || data.uploadedByUserId <= 0) {
      throw new Error('Valid user ID is required');
    }

    // Execute repository method
    return await this.paymentProofRepository.upload(data);
  }
}

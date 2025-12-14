import { IReceiptRepository } from "@/entities/billing/infrastructure/IReceiptRepository";
import { ReceiptEntity, GenerateReceiptData } from "@/entities/billing/domain/ReceiptEntity";

export class GenerateReceiptUseCase {
  constructor(
    private receiptRepository: IReceiptRepository
  ) {}

  async execute(data: GenerateReceiptData): Promise<ReceiptEntity> {
    // Input validation
    if (!data.reservationId || data.reservationId <= 0) {
      throw new Error('Valid reservation ID is required');
    }

    if (!data.templateId || data.templateId <= 0) {
      throw new Error('Valid template ID is required');
    }

    // Execute repository method
    return await this.receiptRepository.generate(data);
  }
}

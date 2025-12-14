import { IReceiptRepository } from "@/entities/billing/infrastructure/IReceiptRepository";
import { ReceiptEntity, SendReceiptData } from "@/entities/billing/domain/ReceiptEntity";

export class SendReceiptByEmailUseCase {
  constructor(
    private receiptRepository: IReceiptRepository
  ) {}

  async execute(data: SendReceiptData): Promise<ReceiptEntity> {
    // Input validation
    if (!data.receiptId || data.receiptId <= 0) {
      throw new Error('Valid receipt ID is required');
    }

    if (!data.email || !data.email.includes('@')) {
      throw new Error('Valid email is required');
    }

    // Execute repository method
    return await this.receiptRepository.sendByEmail(data);
  }
}

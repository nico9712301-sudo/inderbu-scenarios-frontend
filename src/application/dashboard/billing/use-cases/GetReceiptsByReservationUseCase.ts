import { IReceiptRepository } from "@/entities/billing/infrastructure/IReceiptRepository";
import { ReceiptEntity } from "@/entities/billing/domain/ReceiptEntity";

export class GetReceiptsByReservationUseCase {
  constructor(
    private receiptRepository: IReceiptRepository
  ) {}

  async execute(reservationId: number): Promise<ReceiptEntity[]> {
    // Input validation
    if (!reservationId || reservationId <= 0) {
      throw new Error('Valid reservation ID is required');
    }

    // Execute repository method
    return await this.receiptRepository.getByReservationId(reservationId);
  }
}

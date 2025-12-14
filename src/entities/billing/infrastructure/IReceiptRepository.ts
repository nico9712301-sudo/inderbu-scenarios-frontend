import { ReceiptEntity, GenerateReceiptData, SendReceiptData } from '../domain/ReceiptEntity';

export interface IReceiptRepository {
  generate(data: GenerateReceiptData): Promise<ReceiptEntity>;
  sendByEmail(data: SendReceiptData): Promise<ReceiptEntity>;
  getByReservationId(reservationId: number): Promise<ReceiptEntity[]>;
  download(receiptId: number): Promise<Blob>;
}

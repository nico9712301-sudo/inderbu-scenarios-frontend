import { PaymentProofEntity, UploadPaymentProofData } from '../domain/PaymentProofEntity';

export interface IPaymentProofRepository {
  upload(data: UploadPaymentProofData): Promise<PaymentProofEntity>;
  getByReservationId(reservationId: number): Promise<PaymentProofEntity[]>;
}

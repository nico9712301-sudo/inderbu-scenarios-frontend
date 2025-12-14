import { executeWithDomainError } from "./execute-with-domain-error.wrapper";
import { IPaymentProofRepository } from "@/entities/billing/infrastructure/IPaymentProofRepository";
import { PaymentProofEntity, UploadPaymentProofData } from "@/entities/billing/domain/PaymentProofEntity";
import { IHttpClient } from "@/shared/api/types";
import { BackendResponse } from "@/shared/api/backend-types";

export class PaymentProofRepository implements IPaymentProofRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  async upload(data: UploadPaymentProofData): Promise<PaymentProofEntity> {
    return executeWithDomainError(async () => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('reservationId', data.reservationId.toString());
      formData.append('uploadedByUserId', data.uploadedByUserId.toString());

      const result = await this.httpClient.post<BackendResponse<any>>(
        "/api/payment-proofs/upload",
        formData
      );

      return PaymentProofEntity.fromApiData(result.data);
    }, "Failed to upload payment proof");
  }

  async getByReservationId(reservationId: number): Promise<PaymentProofEntity[]> {
    return executeWithDomainError(async () => {
      const result = await this.httpClient.get<PaymentProofEntity[]>(
        `/api/payment-proofs/reservation/${reservationId}`
      );

      return Array.isArray(result)
        ? result.map((item) => PaymentProofEntity.fromApiData(item))
        : [];
    }, "Failed to get payment proofs by reservation");
  }
}

export const createPaymentProofRepository = (httpClient: IHttpClient): IPaymentProofRepository => {
  return new PaymentProofRepository(httpClient);
};

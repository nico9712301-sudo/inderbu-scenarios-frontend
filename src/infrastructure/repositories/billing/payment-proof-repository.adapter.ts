import { executeWithDomainError } from "./execute-with-domain-error.wrapper";
import { IPaymentProofRepository } from "@/entities/billing/infrastructure/IPaymentProofRepository";
import { PaymentProofEntity, UploadPaymentProofData } from "@/entities/billing/domain/PaymentProofEntity";
import { IHttpClient } from "@/shared/api/types";
import { BackendResponse, isBackendResponse } from "@/shared/api/backend-types";

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

      // Extract data from BackendResponse if needed
      const paymentProofData = isBackendResponse(result) ? result.data : result;
      return PaymentProofEntity.fromApiData(paymentProofData);
    }, "Failed to upload payment proof");
  }

  async getByReservationId(reservationId: number): Promise<PaymentProofEntity[]> {
    return executeWithDomainError(async () => {
      const result = await this.httpClient.get<BackendResponse<PaymentProofEntity[]> | PaymentProofEntity[]>(
        `/api/payment-proofs/reservation/${reservationId}`
      );

      // Extract array from BackendResponse if needed
      const paymentProofsArray = isBackendResponse(result) ? result.data : result;

      return Array.isArray(paymentProofsArray)
        ? paymentProofsArray.map((item) => PaymentProofEntity.fromApiData(item))
        : [];
    }, "Failed to get payment proofs by reservation");
  }
}

export const createPaymentProofRepository = (httpClient: IHttpClient): IPaymentProofRepository => {
  return new PaymentProofRepository(httpClient);
};

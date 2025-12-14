import { executeWithDomainError } from "./execute-with-domain-error.wrapper";
import { IReceiptRepository } from "@/entities/billing/infrastructure/IReceiptRepository";
import { ReceiptEntity, GenerateReceiptData, SendReceiptData } from "@/entities/billing/domain/ReceiptEntity";
import { IHttpClient } from "@/shared/api/types";
import { BackendResponse, isBackendResponse } from "@/shared/api/backend-types";

export class ReceiptRepository implements IReceiptRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  async generate(data: GenerateReceiptData): Promise<ReceiptEntity> {
    return executeWithDomainError(async () => {
      console.log('[ReceiptRepository.generate] Request data:', {
        reservationId: data.reservationId,
        templateId: data.templateId,
        customerEmail: data.customerEmail,
      });

      const result = await this.httpClient.post<BackendResponse<any>>(
        "/api/receipts/generate",
        {
          reservationId: data.reservationId,
          templateId: data.templateId,
          customerEmail: data.customerEmail,
          hourlyPrice: data.hourlyPrice,
          totalCost: data.totalCost,
        }
      );

      console.log('[ReceiptRepository.generate] Backend response (full):', JSON.stringify(result, null, 2));
      console.log('[ReceiptRepository.generate] Response type:', typeof result);
      console.log('[ReceiptRepository.generate] Has data property:', 'data' in result);
      
      // Handle both BackendResponse format and direct data format
      const receiptData = (result as any).data || result;
      console.log('[ReceiptRepository.generate] Receipt data to parse:', receiptData);

      const receipt = ReceiptEntity.fromApiData(receiptData);
      console.log('[ReceiptRepository.generate] Parsed receipt:', receipt);
      return receipt;
    }, "Failed to generate receipt");
  }

  async sendByEmail(data: SendReceiptData): Promise<ReceiptEntity> {
    return executeWithDomainError(async () => {
      const result = await this.httpClient.post<BackendResponse<any>>(
        "/api/receipts/send",
        {
          receiptId: data.receiptId,
          email: data.email,
        }
      );

      return ReceiptEntity.fromApiData(result.data);
    }, "Failed to send receipt by email");
  }

  async getByReservationId(reservationId: number): Promise<ReceiptEntity[]> {
    return executeWithDomainError(async () => {
      const result = await this.httpClient.get<BackendResponse<ReceiptEntity[]> | ReceiptEntity[]>(
        `/api/receipts/reservation/${reservationId}`
      );

      // Handle both BackendResponse format and direct array format
      let receipts: any[];
      if (isBackendResponse(result)) {
        receipts = result.data;
      } else if (Array.isArray(result)) {
        receipts = result;
      } else {
        receipts = [];
      }

      return receipts.map((item) => ReceiptEntity.fromApiData(item));
    }, "Failed to get receipts by reservation");
  }

  async download(receiptId: number): Promise<Blob> {
    return executeWithDomainError(async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/receipts/${receiptId}/render`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to render receipt: ${response.statusText}`);
      }

      return await response.blob();
    }, "Failed to render receipt");
  }
}

export const createReceiptRepository = (httpClient: IHttpClient): IReceiptRepository => {
  return new ReceiptRepository(httpClient);
};

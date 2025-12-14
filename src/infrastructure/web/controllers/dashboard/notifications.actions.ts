"use server";

import { ErrorHandlerComposer } from '@/shared/api/error-handler';

/**
 * Notification Server Actions
 * 
 * Next.js Server Actions for handling notifications.
 */

export interface NotificationResponseDto {
  id: number;
  type: 'payment_proof_uploaded' | 'receipt_generated' | 'receipt_sent';
  title: string;
  message: string;
  reservationId: number | null;
  paymentProofId: number | null;
  receiptId: number | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// GET UNREAD NOTIFICATIONS
// =============================================================================

export async function getUnreadNotificationsAction() {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const { ClientHttpClientFactory, createClientAuthContext } = await import('@/shared/api/http-client-client');
    
    const httpClient = ClientHttpClientFactory.createClient(createClientAuthContext());
    const result = await httpClient.get<NotificationResponseDto[]>('/api/notifications/unread/all');

    return result;
  }, 'getUnreadNotificationsAction');
}

// =============================================================================
// GET UNREAD NOTIFICATIONS COUNT
// =============================================================================

export async function getUnreadNotificationsCountAction() {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const { ClientHttpClientFactory, createClientAuthContext } = await import('@/shared/api/http-client-client');
    
    const httpClient = ClientHttpClientFactory.createClient(createClientAuthContext());
    const result = await httpClient.get<{ count: number }>('/api/notifications/unread/count');

    return result.count;
  }, 'getUnreadNotificationsCountAction');
}

// =============================================================================
// MARK NOTIFICATION AS READ
// =============================================================================

export async function markNotificationAsReadAction(notificationId: number) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const { ClientHttpClientFactory, createClientAuthContext } = await import('@/shared/api/http-client-client');
    
    const httpClient = ClientHttpClientFactory.createClient(createClientAuthContext());
    const result = await httpClient.put<NotificationResponseDto>(
      `/api/notifications/${notificationId}/read`,
      {}
    );

    return result;
  }, 'markNotificationAsReadAction');
}

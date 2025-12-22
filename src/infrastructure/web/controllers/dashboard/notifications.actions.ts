"use server";

import { ErrorHandlerComposer } from '@/shared/api/error-handler';
import { isBackendResponse, type BackendResponse } from '@/shared/api/backend-types';

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
    const result = await httpClient.get<BackendResponse<NotificationResponseDto[]> | NotificationResponseDto[]>('/api/notifications/unread/all');

    // Extract array from BackendResponse if needed
    if (isBackendResponse<NotificationResponseDto[]>(result)) {
      return result.data;
    }
    
    // If it's already an array, return it directly
    return Array.isArray(result) ? result : [];
  }, 'getUnreadNotificationsAction');
}

// =============================================================================
// GET ALL NOTIFICATIONS
// =============================================================================

export async function getAllNotificationsAction(page: number = 1, limit: number = 50) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const { ClientHttpClientFactory, createClientAuthContext } = await import('@/shared/api/http-client-client');
    
    const httpClient = ClientHttpClientFactory.createClient(createClientAuthContext());
    const result = await httpClient.get<BackendResponse<{ data: NotificationResponseDto[]; total: number; page: number; limit: number }> | { data: NotificationResponseDto[]; total: number; page: number; limit: number }>(
      `/api/notifications?page=${page}&limit=${limit}`
    );

    // Extract data from BackendResponse if needed
    if (isBackendResponse<{ data: NotificationResponseDto[]; total: number; page: number; limit: number }>(result)) {
      return result.data;
    }
    
    // If it's already the response object, return it directly
    return result as { data: NotificationResponseDto[]; total: number; page: number; limit: number };
  }, 'getAllNotificationsAction');
}

// =============================================================================
// GET UNREAD NOTIFICATIONS COUNT
// =============================================================================

export async function getUnreadNotificationsCountAction() {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const { ClientHttpClientFactory, createClientAuthContext } = await import('@/shared/api/http-client-client');
    
    const httpClient = ClientHttpClientFactory.createClient(createClientAuthContext());
    const result = await httpClient.get<BackendResponse<{ count: number }> | { count: number }>('/api/notifications/unread/count');

    // Extract count from BackendResponse if needed
    if (isBackendResponse<{ count: number }>(result)) {
      return result.data.count;
    }
    
    // If it's already an object with count, return count directly
    return (result as any).count || 0;
  }, 'getUnreadNotificationsCountAction');
}

// =============================================================================
// MARK NOTIFICATION AS READ
// =============================================================================

export async function markNotificationAsReadAction(notificationId: number) {
  return await ErrorHandlerComposer.withErrorHandling(async () => {
    const { ClientHttpClientFactory, createClientAuthContext } = await import('@/shared/api/http-client-client');
    
    const httpClient = ClientHttpClientFactory.createClient(createClientAuthContext());
    const result = await httpClient.put<BackendResponse<NotificationResponseDto> | NotificationResponseDto>(
      `/api/notifications/${notificationId}/read`,
      {}
    );

    // Extract NotificationResponseDto from BackendResponse if needed
    if (isBackendResponse<NotificationResponseDto>(result)) {
      return result.data;
    }
    
    // If it's already a NotificationResponseDto, return it directly
    return result as NotificationResponseDto;
  }, 'markNotificationAsReadAction');
}

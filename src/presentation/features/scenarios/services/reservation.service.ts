// NEW DDD ARCHITECTURE - Reservation Service (Clean, uses authenticated HTTP client)

import { createReservationRepository } from '@/entities/reservation/infrastructure/reservation-repository.adapter';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';

export async function createReservation(payload: {
  subScenarioId: number;
  timeSlotId: number;
  reservationDate: string;
  comments?: string;
}) {
  console.log('ReservationService: Using NEW DDD Architecture with Authenticated HTTP Client');
  
  try {
    // NEW: Use authenticated HTTP client (handles auth headers automatically)
    const httpClient = ClientHttpClientFactory.createClientWithAuth();
    const repository = createReservationRepository(httpClient);
    
    // Create reservation using repository pattern
    const reservation = await repository.create({
      subScenarioId: payload.subScenarioId,
      timeSlotId: payload.timeSlotId,
      reservationDate: payload.reservationDate,
      comments: payload.comments
    });

    console.log('ReservationService: Reservation created successfully via authenticated HTTP client');
    return reservation;

  } catch (error) {
    console.error("ReservationService: Error creating reservation:", error);
    throw error;
  }
}
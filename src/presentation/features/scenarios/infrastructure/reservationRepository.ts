// Infrastructure: Reservation Repository Adapter (DDD Architecture)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface CreateReservationPayload {
  subScenarioId: number;
  timeSlotId: number;
  reservationDate: string;
}

interface ReservationApiResponse {
  id: number;
  subScenarioId: number;
  timeSlotId: number;
  reservationDate: string;
  status: string;
  createdAt: string;
}

// Clean Reservation API Service (no server contamination)
export async function createReservationApi(payload: CreateReservationPayload): Promise<ReservationApiResponse> {
  try {
    const url = `${API_BASE_URL}/reservations`;
    console.log('Creating reservation at:', url, 'with payload:', payload);

    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to create reservation: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data: ReservationApiResponse = await response.json();
    
    console.log('Reservation created successfully:', data);
    return data;

  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
}

// Repository Adapter Pattern (bridges domain to API)
export class ReservationRepositoryAdapter {
  async createReservation(payload: CreateReservationPayload): Promise<ReservationApiResponse> {
    console.log('ReservationRepositoryAdapter: Executing createReservation with:', payload);
    
    try {
      const data = await createReservationApi(payload);
      
      console.log('ReservationRepositoryAdapter: Reservation created successfully');
      return data;
    } catch (error) {
      console.error('ReservationRepositoryAdapter: Error:', error);
      throw error;
    }
  }
}

// Export service object for easy usage
export const reservationApiService = {
  createReservationApi
};
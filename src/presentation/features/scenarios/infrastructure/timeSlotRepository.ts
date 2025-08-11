// Infrastructure: TimeSlot Repository Adapter (DDD Architecture)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface TimeSlotApiData {
  id: number;
  startTime: string;
  endTime: string;
  available: boolean; // FIXED: API uses 'available' not 'isAvailable'
}

interface GetTimeSlotParams {
  subScenarioId: number;
  date: string;
}

// Clean TimeSlot API Service (no server contamination)
export async function getTimeSlots(params: GetTimeSlotParams): Promise<TimeSlotApiData[]> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.append('subScenarioId', params.subScenarioId.toString());
    searchParams.append('date', params.date);

    const url = `${API_BASE_URL}/reservations/available-timeslots?${searchParams.toString()}`;
    console.log('Fetching time slots from:', url);

    const response = await fetch(url, {
      cache: 'no-store', // Dynamic data
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch time slots: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // HANDLE API RESPONSE FORMAT: {statusCode, message, data: []}
    let timeSlots: TimeSlotApiData[];
    
    if (data && Array.isArray(data.data)) {
      // API returns: {statusCode: 200, message: "Success", data: [...]}
      timeSlots = data.data;
      console.log('Using data.data array:', timeSlots.length, 'slots');
    } else if (Array.isArray(data)) {
      // Direct array response (fallback)
      timeSlots = data;
      console.log('Using direct array:', timeSlots.length, 'slots');
    } else {
      console.warn('Unexpected API response format:', data);
      timeSlots = [];
    }
    
    console.log(`Fetched ${timeSlots.length} time slots for scenario ${params.subScenarioId} on ${params.date}`);
    return timeSlots;

  } catch (error) {
    console.error('Error fetching time slots:', error);
    throw error;
  }
}

// Repository Adapter Pattern (bridges domain to API)
export class TimeSlotRepositoryAdapter {
  async findAvailableTimeSlots(params: GetTimeSlotParams): Promise<TimeSlotApiData[]> {
    console.log('TimeSlotRepositoryAdapter: Executing findAvailableTimeSlots with:', params);
    
    try {
      const data = await getTimeSlots(params);
      
      console.log(`TimeSlotRepositoryAdapter: Found ${data.length} available time slots`);
      return data;
    } catch (error) {
      console.error('TimeSlotRepositoryAdapter: Error:', error);
      throw error;
    }
  }
}

// Export service object for easy usage
export const timeSlotApiService = {
  getTimeSlots
};
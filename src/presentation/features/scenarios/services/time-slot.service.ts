// NEW DDD ARCHITECTURE - Time Slot Service (Clean, no server contamination)

import { TimeSlotRepositoryAdapter } from "../infrastructure/timeSlotRepository";
import { IGetAllTimeSlotResponse } from "../interfaces/get-all-time-slot-res.interface";
import { IGetAllTimeSlotRequest } from "../interfaces/get-all-time-slot-req.interface";

export class TimeSlotService {
  static async getAllTimeSlots({
    subScenarioId,
    date,
  }: IGetAllTimeSlotRequest): Promise<IGetAllTimeSlotResponse[]> {
    
    console.log('TimeSlotService: Using NEW DDD Architecture');
    
    try {
      // Convert subScenarioId to number if it's string
      const numericSubScenarioId = typeof subScenarioId === 'string' 
        ? parseInt(subScenarioId, 10) 
        : subScenarioId;
      
      if (isNaN(numericSubScenarioId) || numericSubScenarioId <= 0) {
        console.warn('Invalid subScenarioId:', subScenarioId);
        return [];
      }

      // NEW: Use clean Repository Adapter (no apiClient contamination)
      const repository = new TimeSlotRepositoryAdapter();
      const timeSlots = await repository.findAvailableTimeSlots({
        subScenarioId: numericSubScenarioId,
        date
      });

      // FIX: Transform API response to expected interface format
      const transformedSlots: IGetAllTimeSlotResponse[] = timeSlots.map(slot => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        available: slot.available, // REAL FIX: Use slot.available (not slot.isAvailable)
        dayOfWeek: undefined // Optional field
      }));

      console.log(`TimeSlotService: Successfully retrieved ${transformedSlots.length} time slots`);
      return transformedSlots;

    } catch (error) {
      console.error('TimeSlotService: Error getting time slots:', error);
      throw error;
    }
  }
}
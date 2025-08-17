// Application Layer: Get Availability Use Case

import { 
  IReservationRepository, 
  AvailabilityConfiguration,
  SimplifiedAvailabilityResponse
} from '@/entities/reservation/infrastructure/IReservationRepository';

export interface AvailabilityQuery {
  subScenarioId: number;
  initialDate: string;
  finalDate?: string;
  weekdays?: number[];
}

// Re-export for convenience
export type AvailabilityResult = SimplifiedAvailabilityResponse;

export interface GetAvailabilityUseCase {
  execute(query: AvailabilityQuery): Promise<AvailabilityResult>;
}

export class GetAvailabilityUseCaseImpl implements GetAvailabilityUseCase {
  constructor(
    private readonly reservationRepository: IReservationRepository
  ) {}

  async execute(query: AvailabilityQuery): Promise<AvailabilityResult> {
    console.log('GetAvailabilityUseCase: Starting execution with query:', query);

    try {
      // Convert AvailabilityQuery to AvailabilityConfiguration
      const config: AvailabilityConfiguration = {
        subScenarioId: query.subScenarioId,
        initialDate: query.initialDate,
        finalDate: query.finalDate,
        weekdays: query.weekdays,
      };

      // Call repository method
      const result = await this.reservationRepository.getAvailabilityForConfiguration(config);

      console.log('GetAvailabilityUseCase: Execution completed successfully');
      return result;

    } catch (error) {
      console.error('GetAvailabilityUseCase: Execution failed:', error);
      throw error;
    }
  }
}

// Factory function for DI
export function createGetAvailabilityUseCase(
  reservationRepository: IReservationRepository
): GetAvailabilityUseCase {
  return new GetAvailabilityUseCaseImpl(reservationRepository);
}
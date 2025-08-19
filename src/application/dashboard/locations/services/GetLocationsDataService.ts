import { CommuneFilters } from '@/entities/commune/infrastructure/commune-repository.port';
import { NeighborhoodFilters } from '@/entities/neighborhood/infrastructure/INeighborhoodRepository';
import { GetLocationsDataUseCase, ILocationsDataResponse } from '../use-cases/GetLocationsDataUseCase';

export type { ILocationsDataResponse };

export class GetLocationsDataService {
  constructor(
    private readonly getLocationsDataUseCase: GetLocationsDataUseCase
  ) {}

  async execute(
    communeFilters: CommuneFilters = {},
    neighborhoodFilters: NeighborhoodFilters = {}
  ): Promise<ILocationsDataResponse> {
    try {
      // Delegate to use case - application service acts as orchestrator
      return await this.getLocationsDataUseCase.execute(communeFilters, neighborhoodFilters);
    } catch (error) {
      console.error('Error in GetLocationsDataService:', error);
      throw error;
    }
  }
}
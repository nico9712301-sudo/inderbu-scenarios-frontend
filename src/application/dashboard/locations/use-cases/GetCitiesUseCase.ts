import type { ICityRepository, CityFilters } from '@/entities/city/infrastructure/city-repository.port';
import { CityEntity, CityDomainError } from '@/entities/city/domain/CityEntity';

export class GetCitiesUseCase {
  constructor(
    private readonly cityRepository: ICityRepository
  ) { }

  async execute(filters: CityFilters = {}): Promise<CityEntity[]> {
    try {
      // Repository handles filtering, just pass filters directly
      return await this.cityRepository.getAll(filters);

    } catch (error) {
      console.error('Error in GetCitiesUseCase:', error);
      
      // Re-throw domain errors as-is
      if (error instanceof CityDomainError) {
        throw error;
      }
      
      // Wrap other errors in domain error
      throw new CityDomainError(
        `Use case execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
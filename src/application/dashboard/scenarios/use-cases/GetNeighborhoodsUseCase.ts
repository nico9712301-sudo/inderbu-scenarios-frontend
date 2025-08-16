import { NeighborhoodEntity, NeighborhoodSearchCriteria, NeighborhoodDomainError } from '@/entities/neighborhood/domain/NeighborhoodEntity';
import type { INeighborhoodRepository, PaginatedNeighborhoods, NeighborhoodFilters } from '@/entities/neighborhood/infrastructure/INeighborhoodRepository';

export class GetNeighborhoodsUseCase {
  constructor(
    private readonly neighborhoodRepository: INeighborhoodRepository
  ) {}

  async execute(filters?: NeighborhoodFilters): Promise<PaginatedNeighborhoods> {
    try {
      // Repository handles filtering, just pass filters directly
      return await this.neighborhoodRepository.getAll(filters);

    } catch (error) {
      console.error('Error in GetNeighborhoodsUseCase:', error);
      
      // Re-throw domain errors as-is
      if (error instanceof NeighborhoodDomainError) {
        throw error;
      }
      
      // Wrap other errors in domain error
      throw new NeighborhoodDomainError(
        `Use case execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
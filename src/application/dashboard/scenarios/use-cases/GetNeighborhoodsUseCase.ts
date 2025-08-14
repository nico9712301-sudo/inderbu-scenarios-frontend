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

  // Additional use case method for finding by commune
  async findByCommuneId(communeId: number): Promise<NeighborhoodEntity[]> {
    try {
      if (communeId <= 0) {
        throw new NeighborhoodDomainError('Invalid commune ID');
      }

      const entities = await this.neighborhoodRepository.findByCommuneId(communeId);
      
      // Domain business rule: only return active entities
      return entities.filter(entity => entity.isActive());

    } catch (error) {
      console.error('Error in GetNeighborhoodsUseCase.findByCommuneId:', error);
      
      if (error instanceof NeighborhoodDomainError) {
        throw error;
      }
      
      throw new NeighborhoodDomainError(
        `Find by commune ID failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Additional use case method for finding by ID
  async findById(id: number): Promise<NeighborhoodEntity | null> {
    try {
      if (id <= 0) {
        throw new NeighborhoodDomainError('Invalid neighborhood ID');
      }

      const entity = await this.neighborhoodRepository.getById(id);
      
      // Domain business rule: only return active entities
      if (entity && !entity.isActive()) {
        return null;
      }

      return entity;

    } catch (error) {
      console.error('Error in GetNeighborhoodsUseCase.findById:', error);
      
      if (error instanceof NeighborhoodDomainError) {
        throw error;
      }
      
      throw new NeighborhoodDomainError(
        `Find by ID failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
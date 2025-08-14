import { ActivityAreaEntity, ActivityAreaSearchCriteria, ActivityAreaDomainError } from '@/entities/activity-area/domain/ActivityAreaEntity';
import type { IActivityAreaRepository, PaginatedActivityAreas, ActivityAreaFilters } from '@/entities/activity-area/domain/IActivityAreaRepository';

export class GetActivityAreasUseCase {
  constructor(
    private readonly activityAreaRepository: IActivityAreaRepository
  ) {}

  async execute(filters?: ActivityAreaFilters): Promise<PaginatedActivityAreas> {
    try {
      // Repository handles filtering, just pass filters directly
      return await this.activityAreaRepository.getAll(filters);

    } catch (error) {
      console.error('Error in GetActivityAreasUseCase:', error);
      
      // Re-throw domain errors as-is
      if (error instanceof ActivityAreaDomainError) {
        throw error;
      }
      
      // Wrap other errors in domain error
      throw new ActivityAreaDomainError(
        `Use case execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Additional use case method for finding by ID
  async findById(id: number): Promise<ActivityAreaEntity | null> {
    try {
      if (id <= 0) {
        throw new ActivityAreaDomainError('Invalid activity area ID');
      }

      const entity = await this.activityAreaRepository.getById(id);
      
      // Domain business rule: only return active entities
      if (entity && !entity.isActive()) {
        return null;
      }

      return entity;

    } catch (error) {
      console.error('Error in GetActivityAreasUseCase.findById:', error);
      
      if (error instanceof ActivityAreaDomainError) {
        throw error;
      }
      
      throw new ActivityAreaDomainError(
        `Find by ID failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
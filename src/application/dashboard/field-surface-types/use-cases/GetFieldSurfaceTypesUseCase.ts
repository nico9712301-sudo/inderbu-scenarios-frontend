import { FieldSurfaceTypeEntity, FieldSurfaceTypeSearchCriteria, FieldSurfaceTypeDomainError } from '@/entities/field-surface-type/domain/FieldSurfaceTypeEntity';
import type { IFieldSurfaceTypeRepository, PaginatedFieldSurfaceTypes, FieldSurfaceTypeFilters } from '@/entities/field-surface-type/domain/IFieldSurfaceTypeRepository';

export class GetFieldSurfaceTypesUseCase {
  constructor(
    private readonly fieldSurfaceTypeRepository: IFieldSurfaceTypeRepository
  ) {}

  async execute(filters?: FieldSurfaceTypeFilters): Promise<PaginatedFieldSurfaceTypes> {
    try {
      // Repository handles filtering, just pass filters directly
      return await this.fieldSurfaceTypeRepository.getAll(filters);

    } catch (error) {
      console.error('Error in GetFieldSurfaceTypesUseCase:', error);
      
      // Re-throw domain errors as-is
      if (error instanceof FieldSurfaceTypeDomainError) {
        throw error;
      }
      
      // Wrap other errors in domain error
      throw new FieldSurfaceTypeDomainError(
        `Use case execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Additional use case method for finding by ID
  async findById(id: number): Promise<FieldSurfaceTypeEntity | null> {
    try {
      if (id <= 0) {
        throw new FieldSurfaceTypeDomainError('Invalid field surface type ID');
      }

      const entity = await this.fieldSurfaceTypeRepository.getById(id);
      
      // Domain business rule: only return active entities
      if (entity && !entity.isActive()) {
        return null;
      }

      return entity;

    } catch (error) {
      console.error('Error in GetFieldSurfaceTypesUseCase.findById:', error);
      
      if (error instanceof FieldSurfaceTypeDomainError) {
        throw error;
      }
      
      throw new FieldSurfaceTypeDomainError(
        `Find by ID failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
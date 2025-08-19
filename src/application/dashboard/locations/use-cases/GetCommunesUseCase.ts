import type { ICommuneRepository, CommuneFilters, PaginatedCommunes } from '@/entities/commune/infrastructure/commune-repository.port';
import { CommuneEntity, CommuneDomainError } from '@/entities/commune/domain/CommuneEntity';

export class GetCommunesUseCase {
  constructor(
    private readonly communeRepository: ICommuneRepository
  ) { }

  async execute(filters: CommuneFilters = {}): Promise<PaginatedCommunes> {
    try {
      // Repository handles filtering, just pass filters directly
      return await this.communeRepository.getAll(filters);

    } catch (error) {
      console.error('Error in GetCommunesUseCase:', error);
      
      // Re-throw domain errors as-is
      if (error instanceof CommuneDomainError) {
        throw error;
      }
      
      // Wrap other errors in domain error
      throw new CommuneDomainError(
        `Use case execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async executeSimple(): Promise<CommuneEntity[]> {
    try {
      // Get all communes for select options without pagination
      return await this.communeRepository.getAllSimple();

    } catch (error) {
      console.error('Error in GetCommunesUseCase (simple):', error);
      
      // Re-throw domain errors as-is
      if (error instanceof CommuneDomainError) {
        throw error;
      }
      
      // Wrap other errors in domain error
      throw new CommuneDomainError(
        `Use case execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
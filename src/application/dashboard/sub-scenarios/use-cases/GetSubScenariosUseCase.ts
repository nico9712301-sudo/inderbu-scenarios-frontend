import { ISubScenarioRepository, SubScenariosFilters, PaginatedSubScenarios } from '@/presentation/features/dashboard/sub-scenarios/domain/repositories/ISubScenarioRepository';
import { SubScenarioEntity, SubScenarioDomainError } from '@/entities/sub-scenario/domain/SubScenarioEntity';

export class GetSubScenariosUseCase {
  constructor(
    private readonly subScenarioRepository: ISubScenarioRepository
  ) {}

  async execute(filters: SubScenariosFilters): Promise<PaginatedSubScenarios> {
    try {
      // Repository handles filtering, just pass filters directly
      return await this.subScenarioRepository.getAll(filters);

    } catch (error) {
      console.error('Error in GetSubScenariosUseCase:', error);
      
      // Re-throw domain errors as-is
      if (error instanceof SubScenarioDomainError) {
        throw error;
      }
      
      // Wrap other errors in domain error
      throw new SubScenarioDomainError(
        `Use case execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findById(id: number): Promise<SubScenarioEntity | null> {
    try {
      if (id <= 0) {
        throw new SubScenarioDomainError('Invalid sub-scenario ID');
      }

      return await this.subScenarioRepository.getById(id);

    } catch (error) {
      console.error('Error in GetSubScenariosUseCase.findById:', error);
      
      if (error instanceof SubScenarioDomainError) {
        throw error;
      }
      
      throw new SubScenarioDomainError(
        `Find by ID failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
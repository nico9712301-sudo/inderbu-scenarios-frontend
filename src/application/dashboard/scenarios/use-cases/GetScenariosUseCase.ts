import type { IScenarioRepository, ScenarioFilters, PaginatedScenarios } from '@/entities/scenario/infrastructure/IScenarioRepository';
import { ScenarioEntity, ScenarioDomainError } from '@/entities/scenario/domain/ScenarioEntity';

export class GetScenariosUseCase {
  constructor(
    private readonly scenarioRepository: IScenarioRepository
  ) { }

  async execute(filters: ScenarioFilters = {}): Promise<PaginatedScenarios> {
    try {
      // Repository handles filtering, just pass filters directly
      return await this.scenarioRepository.getAll(filters);

    } catch (error) {
      console.error('Error in GetScenariosUseCase:', error);
      
      // Re-throw domain errors as-is
      if (error instanceof ScenarioDomainError) {
        throw error;
      }
      
      // Wrap other errors in domain error
      throw new ScenarioDomainError(
        `Use case execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findById(id: number): Promise<ScenarioEntity | null> {
    try {
      if (id <= 0) {
        throw new ScenarioDomainError('Invalid scenario ID');
      }

      return await this.scenarioRepository.getById(id);

    } catch (error) {
      console.error('Error in GetScenariosUseCase.findById:', error);
      
      if (error instanceof ScenarioDomainError) {
        throw error;
      }
      
      throw new ScenarioDomainError(
        `Find by ID failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
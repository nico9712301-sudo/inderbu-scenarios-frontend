import { IScenarioRepository } from '@/entities/scenario/infrastructure/scenario-repository.port';
import { ScenarioTransformer } from '@/infrastructure/transformers/ScenarioTransformer';
import { Scenario, CreateScenarioData } from '@/entities/scenario/domain/Scenario';
import { ScenarioEntity } from '@/entities/scenario/domain/ScenarioEntity';

export interface CreateScenarioCommand {
  name: string;
  address: string;
  neighborhoodId: number;
}

export class CreateScenarioUseCase {
  constructor(
    private readonly scenarioRepository: IScenarioRepository
  ) {}

  async execute(command: CreateScenarioCommand): Promise<ScenarioEntity> {
    try {
      // Business validation
      if (!command.name?.trim()) {
        throw new Error('Scenario name is required');
      }
      
      if (!command.address?.trim()) {
        throw new Error('Scenario address is required');
      }
      
      if (!command.neighborhoodId || command.neighborhoodId <= 0) {
        throw new Error('Valid neighborhood ID is required');
      }

      // Convert command to domain data
      const scenario: ScenarioEntity = ScenarioTransformer.toDomain(command);
      return await this.scenarioRepository.create(scenario);
    } catch (error) {
      console.error('Error in CreateScenarioUseCase:', error);
      throw error;
    }
  }
}

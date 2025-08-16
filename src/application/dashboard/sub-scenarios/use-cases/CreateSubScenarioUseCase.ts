import { SubScenarioEntity } from '@/entities/sub-scenario/domain/SubScenarioEntity';
import { ISubScenarioRepository } from '@/entities/sub-scenario/infrastructure/ISubScenarioRepository';
import { SubScenarioTransformer } from '@/infrastructure/transformers/SubScenarioTransformer';

export interface CreateSubScenarioCommand {
  name: string;
  hasCost: boolean;
  numberOfSpectators: number;
  numberOfPlayers: number;
  recommendations?: string;
  scenarioId: number;
  activityAreaId: number;
  fieldSurfaceTypeId: number;
  active: boolean;
}

export class CreateSubScenarioUseCase {
  constructor(
    private readonly subScenarioRepository: ISubScenarioRepository
  ) {}

  async execute(command: CreateSubScenarioCommand): Promise<SubScenarioEntity> {
    try {
      // Business validation
      if (!command.name?.trim()) {
        throw new Error('Sub-scenario name is required');
      }
      
      if (!command.scenarioId || command.scenarioId <= 0) {
        throw new Error('Valid scenario ID is required');
      }
      
      if (!command.activityAreaId || command.activityAreaId <= 0) {
        throw new Error('Valid activity area ID is required');
      }
      
      if (!command.fieldSurfaceTypeId || command.fieldSurfaceTypeId <= 0) {
        throw new Error('Valid field surface type ID is required');
      }

      if (command.numberOfSpectators < 0) {
        throw new Error('Number of spectators cannot be negative');
      }

      if (command.numberOfPlayers < 0) {
        throw new Error('Number of players cannot be negative');
      }

      const subscenarioEntity: SubScenarioEntity = SubScenarioTransformer.toDomain(command);

      return await this.subScenarioRepository.create(subscenarioEntity);
    } catch (error) {
      console.error('Error in CreateSubScenarioUseCase:', error);
      throw error;
    }
  }
}
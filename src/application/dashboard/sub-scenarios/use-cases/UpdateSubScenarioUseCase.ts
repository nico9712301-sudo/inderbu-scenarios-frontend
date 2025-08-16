import { SubScenarioEntity } from '@/entities/sub-scenario/domain/SubScenarioEntity';
import { ISubScenarioRepository } from '@/entities/sub-scenario/infrastructure/ISubScenarioRepository';
import { SubScenarioTransformer } from '@/infrastructure/transformers/SubScenarioTransformer';

export interface UpdateSubScenarioCommand {
  name?: string;
  hasCost?: boolean;
  numberOfSpectators?: number;
  numberOfPlayers?: number;
  recommendations?: string;
  scenarioId?: number;
  activityAreaId?: number;
  fieldSurfaceTypeId?: number;
  active?: boolean;
}

export class UpdateSubScenarioUseCase {
  constructor(
    private readonly subScenarioRepository: ISubScenarioRepository
  ) {}

  async execute(id: number, command: UpdateSubScenarioCommand): Promise<SubScenarioEntity> {
    console.log("Executing UpdateSubScenarioUseCase with ID:", id, "and command:", command);
    
    try {
      // Input validation
      if (!id || id <= 0) {
        throw new Error('Valid sub-scenario ID is required');
      }

      // Business validation for provided fields
      if (command.name !== undefined && !command.name?.trim()) {
        throw new Error('Sub-scenario name cannot be empty');
      }
      
      if (command.scenarioId !== undefined && command.scenarioId <= 0) {
        throw new Error('Valid scenario ID is required');
      }
      
      if (command.activityAreaId !== undefined && command.activityAreaId <= 0) {
        throw new Error('Valid activity area ID is required');
      }
      
      if (command.fieldSurfaceTypeId !== undefined && command.fieldSurfaceTypeId <= 0) {
        throw new Error('Valid field surface type ID is required');
      }

      if (command.numberOfSpectators !== undefined && command.numberOfSpectators < 0) {
        throw new Error('Number of spectators cannot be negative');
      }

      if (command.numberOfPlayers !== undefined && command.numberOfPlayers < 0) {
        throw new Error('Number of players cannot be negative');
      }

      // Check if this is a simple status toggle (only active field)
      const commandKeys = Object.keys(command);
      const isSimpleStatusToggle = commandKeys.length === 1 && commandKeys[0] === 'active';
      
      if (isSimpleStatusToggle) {
        // For simple status toggle, use the dedicated domain method
        console.log('UpdateSubScenarioUseCase - Performing simple status toggle using domain method');
        return await this.subScenarioRepository.updateActiveStatus(id, command.active!);
      }

      // For complex updates, build complete entity data
      const entityData: any = {};
      
      // Only include fields that were actually provided in the command
      if (command.name !== undefined) entityData.name = command.name.trim();
      if (command.hasCost !== undefined) entityData.hasCost = command.hasCost;
      if (command.numberOfSpectators !== undefined) entityData.numberOfSpectators = command.numberOfSpectators;
      if (command.numberOfPlayers !== undefined) entityData.numberOfPlayers = command.numberOfPlayers;
      if (command.recommendations !== undefined) entityData.recommendations = command.recommendations?.trim() || '';
      if (command.active !== undefined) entityData.active = command.active;

      // For relationships, create minimal objects if IDs are provided
      if (command.scenarioId !== undefined) {
        entityData.scenario = {
          id: command.scenarioId,
          name: '',
          address: ''
        };
      }
      
      if (command.activityAreaId !== undefined) {
        entityData.activityArea = {
          id: command.activityAreaId,
          name: ''
        };
      }
      
      if (command.fieldSurfaceTypeId !== undefined) {
        entityData.fieldSurfaceType = {
          id: command.fieldSurfaceTypeId,
          name: ''
        };
      }

      // Since we need required fields for entity creation, use transformer for partial data
      // Use forUpdate: true to remove ID (DDD compliance for updates)
      const subScenarioEntity: SubScenarioEntity = SubScenarioTransformer.toDomain(entityData, { forUpdate: true });

      return await this.subScenarioRepository.update(id, subScenarioEntity);
    } catch (error) {
      console.error('Error in UpdateSubScenarioUseCase:', error);
      throw error;
    }
  }
}
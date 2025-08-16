import { Scenario, UpdateScenarioData } from '@/entities/scenario/domain/Scenario';
import { ScenarioEntity } from '@/entities/scenario/domain/ScenarioEntity';
import { IScenarioRepository } from '@/entities/scenario/infrastructure/scenario-repository.port';

export interface UpdateScenarioCommand {
  name?: string;
  address?: string;
  neighborhoodId?: number;
  active?: boolean;
}

export class UpdateScenarioUseCase {
  constructor(
    private readonly scenarioRepository: IScenarioRepository
  ) {}

  async execute(id: number, command: UpdateScenarioCommand): Promise<ScenarioEntity> {
    const updateData = command;
    
    try {
      // Business validation
      if (!id || id <= 0) {
        throw new Error('Valid scenario ID is required');
      }

      // Validate at least one field is being updated
      const hasUpdates = Object.values(updateData).some(value => 
        value !== undefined && value !== null && value !== ''
      );
      
      if (!hasUpdates) {
        throw new Error('At least one field must be updated');
      }

      // Additional business validations
      if (updateData.name !== undefined && !updateData.name.trim()) {
        throw new Error('Scenario name cannot be empty');
      }
      
      if (updateData.address !== undefined && !updateData.address.trim()) {
        throw new Error('Scenario address cannot be empty');
      }
      
      if (updateData.neighborhoodId !== undefined && updateData.neighborhoodId <= 0) {
        throw new Error('Valid neighborhood ID is required');
      }

      // Convert command to domain data
      const domainData: UpdateScenarioData = {
        ...(updateData.name && { name: updateData.name.trim() }),
        ...(updateData.address && { address: updateData.address.trim() }),
        ...(updateData.neighborhoodId && { neighborhoodId: updateData.neighborhoodId }),
        ...(updateData.active !== undefined && { active: updateData.active }),
      };

      return await this.scenarioRepository.update(id, domainData);
    } catch (error) {
      console.error('Error in UpdateScenarioUseCase:', error);
      throw error;
    }
  }
}

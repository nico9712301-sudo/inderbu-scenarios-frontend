import { injectable, inject } from 'inversify';
import { Scenario, CreateScenarioData } from '@/domain/scenario/entities/Scenario';
import type { IScenarioRepository } from '@/domain/scenario/repositories/IScenarioRepository';
import { TYPES } from '@/infrastructure/config/di/types';

export interface CreateScenarioCommand {
  name: string;
  address: string;
  description?: string;
  neighborhoodId: number;
}

@injectable()
export class CreateScenarioUseCase {
  constructor(
    @inject(TYPES.IScenarioRepository) 
    private readonly scenarioRepository: IScenarioRepository
  ) {}

  async execute(command: CreateScenarioCommand): Promise<Scenario> {
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
      const createData: CreateScenarioData = {
        name: command.name.trim(),
        address: command.address.trim(),
        description: command.description?.trim(),
        neighborhoodId: command.neighborhoodId,
      };

      return await this.scenarioRepository.create(createData);
    } catch (error) {
      console.error('Error in CreateScenarioUseCase:', error);
      throw error;
    }
  }
}

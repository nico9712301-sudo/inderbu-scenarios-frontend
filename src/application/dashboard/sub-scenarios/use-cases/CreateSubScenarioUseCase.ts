import { SubScenario } from '@/services/api';
import { ISubScenarioRepository } from '@/entities/sub-scenario/infrastructure/ISubScenarioRepository';

export class CreateSubScenarioUseCase {
  constructor(
    private readonly subScenarioRepository: ISubScenarioRepository
  ) {}

  async execute(data: Omit<SubScenario, "id"> & { images?: any[] }): Promise<SubScenario> {
    return await this.subScenarioRepository.create(data);
  }
}
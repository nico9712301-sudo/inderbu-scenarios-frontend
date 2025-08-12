import { SubScenario } from '@/services/api';
import { ISubScenarioRepository } from '@/presentation/features/dashboard/sub-scenarios/domain/repositories/ISubScenarioRepository';

export class CreateSubScenarioUseCase {
  constructor(
    private readonly subScenarioRepository: ISubScenarioRepository
  ) {}

  async execute(data: Omit<SubScenario, "id"> & { images?: any[] }): Promise<SubScenario> {
    return await this.subScenarioRepository.create(data);
  }
}
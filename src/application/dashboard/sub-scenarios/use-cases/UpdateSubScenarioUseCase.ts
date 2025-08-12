import { SubScenario } from '@/services/api';
import { ISubScenarioRepository } from '@/presentation/features/dashboard/sub-scenarios/domain/repositories/ISubScenarioRepository';

export class UpdateSubScenarioUseCase {
  constructor(
    private readonly subScenarioRepository: ISubScenarioRepository
  ) {}

  async execute(id: number, data: Partial<SubScenario>): Promise<SubScenario> {
    return await this.subScenarioRepository.update(id, data);
  }
}
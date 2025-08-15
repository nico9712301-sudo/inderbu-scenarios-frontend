import { SubScenario } from '@/shared/api/domain-types';
import { ISubScenarioRepository } from '@/entities/sub-scenario/infrastructure/ISubScenarioRepository';

export class UpdateSubScenarioUseCase {
  constructor(
    private readonly subScenarioRepository: ISubScenarioRepository
  ) {}

  async execute(id: number, data: Partial<SubScenario>): Promise<SubScenario> {
    return await this.subScenarioRepository.update(id, data);
  }
}
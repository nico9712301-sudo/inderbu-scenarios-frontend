import { ISubScenarioPriceRepository } from "@/entities/billing/infrastructure/ISubScenarioPriceRepository";
import { SubScenarioPriceEntity } from "@/entities/billing/domain/SubScenarioPriceEntity";

export class GetSubScenarioPriceUseCase {
  constructor(
    private subScenarioPriceRepository: ISubScenarioPriceRepository
  ) {}

  async execute(subScenarioId: number): Promise<SubScenarioPriceEntity | null> {
    // Input validation
    if (!subScenarioId || subScenarioId <= 0) {
      throw new Error('Valid sub-scenario ID is required');
    }

    // Execute repository method
    return await this.subScenarioPriceRepository.getBySubScenarioId(subScenarioId);
  }
}

import { ISubScenarioPriceRepository } from "@/entities/billing/infrastructure/ISubScenarioPriceRepository";

export class DeleteSubScenarioPriceUseCase {
  constructor(
    private subScenarioPriceRepository: ISubScenarioPriceRepository
  ) {}

  async execute(subScenarioId: number): Promise<void> {
    // Input validation
    if (!subScenarioId || subScenarioId <= 0) {
      throw new Error('Valid sub-scenario ID is required');
    }

    // Execute repository method
    await this.subScenarioPriceRepository.deleteBySubScenarioId(subScenarioId);
  }
}

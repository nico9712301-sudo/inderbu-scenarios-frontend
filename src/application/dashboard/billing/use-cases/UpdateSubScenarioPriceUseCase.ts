import { ISubScenarioPriceRepository } from "@/entities/billing/infrastructure/ISubScenarioPriceRepository";
import { SubScenarioPriceEntity, UpdateSubScenarioPriceData } from "@/entities/billing/domain/SubScenarioPriceEntity";

export class UpdateSubScenarioPriceUseCase {
  constructor(
    private subScenarioPriceRepository: ISubScenarioPriceRepository
  ) {}

  async execute(
    subScenarioId: number,
    data: UpdateSubScenarioPriceData
  ): Promise<SubScenarioPriceEntity> {
    // Input validation
    if (!subScenarioId || subScenarioId <= 0) {
      throw new Error('Valid sub-scenario ID is required');
    }

    if (data.hourlyPrice !== undefined) {
      if (data.hourlyPrice <= 0) {
        throw new Error('Hourly price must be greater than 0');
      }

      if (data.hourlyPrice > 10000) {
        throw new Error('Hourly price cannot exceed 10000');
      }
    }

    // Execute repository method
    return await this.subScenarioPriceRepository.updateBySubScenarioId(
      subScenarioId,
      data
    );
  }
}

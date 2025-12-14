import { ISubScenarioPriceRepository } from "@/entities/billing/infrastructure/ISubScenarioPriceRepository";
import { SubScenarioPriceEntity, CreateSubScenarioPriceData } from "@/entities/billing/domain/SubScenarioPriceEntity";

export class CreateSubScenarioPriceUseCase {
  constructor(
    private subScenarioPriceRepository: ISubScenarioPriceRepository
  ) {}

  async execute(data: CreateSubScenarioPriceData): Promise<SubScenarioPriceEntity> {
    // Input validation
    if (!data.subScenarioId || data.subScenarioId <= 0) {
      throw new Error('Valid sub-scenario ID is required');
    }

    if (!data.hourlyPrice || data.hourlyPrice <= 0) {
      throw new Error('Hourly price must be greater than 0');
    }

    if (data.hourlyPrice > 10000) {
      throw new Error('Hourly price cannot exceed 10000');
    }

    // Execute repository method
    return await this.subScenarioPriceRepository.create(data);
  }
}

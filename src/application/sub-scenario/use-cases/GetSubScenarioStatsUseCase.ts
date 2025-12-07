import {
  ISubScenarioRepository,
  SubScenarioStatsFilters,
  SubScenarioStats
} from '@/entities/sub-scenario/infrastructure/ISubScenarioRepository';

export class GetSubScenarioStatsUseCase {
  constructor(
    private readonly subScenarioRepository: ISubScenarioRepository
  ) {}

  async execute(filters?: SubScenarioStatsFilters): Promise<SubScenarioStats> {
    try {
      // Get stats from repository
      const stats = await this.subScenarioRepository.getStats(filters);

      return stats;
    } catch (error) {
      console.error('Error in GetSubScenarioStatsUseCase:', error);
      throw error;
    }
  }
}
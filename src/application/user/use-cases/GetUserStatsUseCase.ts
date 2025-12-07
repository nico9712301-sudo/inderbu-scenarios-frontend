import {
  IUserRepository,
  UserStatsFilters,
  UserStats
} from '@/entities/user/infrastructure/IUserRepository';

export class GetUserStatsUseCase {
  constructor(
    private readonly userRepository: IUserRepository
  ) {}

  async execute(filters?: UserStatsFilters): Promise<UserStats> {
    try {
      // Get stats from repository
      const stats = await this.userRepository.getStats(filters);

      return stats;
    } catch (error) {
      console.error('Error in GetUserStatsUseCase:', error);
      throw error;
    }
  }
}

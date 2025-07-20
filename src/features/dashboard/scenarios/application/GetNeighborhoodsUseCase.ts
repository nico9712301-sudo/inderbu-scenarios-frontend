import { Neighborhood } from '@/services/api';
import { INeighborhoodRepository } from '../domain/repositories/IScenarioRepository';

export class GetNeighborhoodsUseCase {
  constructor(
    private readonly neighborhoodRepository: INeighborhoodRepository
  ) {}

  async execute(): Promise<Neighborhood[]> {
    try {
      return await this.neighborhoodRepository.getAll();
    } catch (error) {
      console.error('Error in GetNeighborhoodsUseCase:', error);
      throw error;
    }
  }
}
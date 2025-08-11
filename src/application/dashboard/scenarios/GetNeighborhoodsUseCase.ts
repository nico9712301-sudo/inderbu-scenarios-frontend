import { injectable, inject } from 'inversify';
import type { INeighborhoodRepository } from '@/entities/neighborhood/infrastructure/INeighborhoodRepository';
import { TYPES } from '@/infrastructure/config/di/types';

@injectable()
export class GetNeighborhoodsUseCase {
  constructor(
    @inject(TYPES.INeighborhoodRepository)
    private readonly neighborhoodRepository: INeighborhoodRepository
  ) {}

  async execute(): Promise<any[]> { // Using any temporarily until we unify types
    try {
      return await this.neighborhoodRepository.findAll();
    } catch (error) {
      console.error('Error in GetNeighborhoodsUseCase:', error);
      throw error;
    }
  }
}
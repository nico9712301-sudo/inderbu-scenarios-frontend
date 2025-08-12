import { injectable, inject } from 'inversify';
import type { INeighborhoodRepository } from '@/entities/neighborhood/infrastructure/INeighborhoodRepository';

@injectable()
export class GetNeighborhoodsUseCase {
  constructor(
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
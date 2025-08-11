import { INeighborhoodRepository, NeighborhoodFilters } from '../repositories/INeighborhoodRepository';
import { Neighborhood, CreateNeighborhoodData, UpdateNeighborhoodData } from '../entities/Neighborhood';

export class NeighborhoodService {
  constructor(private readonly neighborhoodRepository: INeighborhoodRepository) {}

  async getNeighborhoods(filters: NeighborhoodFilters = {}): Promise<Neighborhood[]> {
    return await this.neighborhoodRepository.findAll(filters);
  }

  async getAllNeighborhoods(): Promise<Neighborhood[]> {
    return await this.neighborhoodRepository.findAll();
  }

  async getNeighborhoodById(id: number): Promise<Neighborhood | null> {
    return await this.neighborhoodRepository.findById(id);
  }

  async getNeighborhoodsByCommuneId(communeId: number): Promise<Neighborhood[]> {
    return await this.neighborhoodRepository.findByCommuneId(communeId);
  }

  async createNeighborhood(data: CreateNeighborhoodData): Promise<Neighborhood> {
    // Business logic validation could go here
    this.validateNeighborhoodData(data);
    
    return await this.neighborhoodRepository.create(data);
  }

  async updateNeighborhood(id: number, data: UpdateNeighborhoodData): Promise<Neighborhood> {
    // Business logic validation could go here
    if (data.name !== undefined) {
      this.validateNeighborhoodName(data.name);
    }
    
    return await this.neighborhoodRepository.update(id, data);
  }

  async deleteNeighborhood(id: number): Promise<void> {
    // Business logic validation could go here
    await this.neighborhoodRepository.delete(id);
  }

  // Private validation methods (business rules)
  private validateNeighborhoodData(data: CreateNeighborhoodData): void {
    if (!data.name.trim()) {
      throw new Error('Neighborhood name is required');
    }

    if (data.name.length < 2) {
      throw new Error('Neighborhood name must be at least 2 characters long');
    }

    if (!data.communeId || data.communeId <= 0) {
      throw new Error('Valid commune ID is required');
    }
  }

  private validateNeighborhoodName(name: string): void {
    if (!name.trim()) {
      throw new Error('Neighborhood name is required');
    }

    if (name.length < 2) {
      throw new Error('Neighborhood name must be at least 2 characters long');
    }
  }
}

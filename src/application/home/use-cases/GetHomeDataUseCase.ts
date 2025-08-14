import { GetHomeDataService, HomeFilters, IHomeDataResponse } from '../services/GetHomeDataService';

/**
 * Get Home Data Use Case
 * 
 * Simple use case that delegates to the application service.
 * Maintains the use case pattern while leveraging the cross-domain service.
 * This approach allows for future business logic specific to home page.
 */
export class GetHomeDataUseCase {
  constructor(
    private readonly getHomeDataService: GetHomeDataService
  ) {}

  async execute(filters: HomeFilters): Promise<IHomeDataResponse> {
    try {
      // Home-specific business validation could go here
      // For now, delegate to the application service
      return await this.getHomeDataService.execute(filters);

    } catch (error) {
      console.error('Error in GetHomeDataUseCase:', error);
      throw error;
    }
  }
}
import { GetHomeDataUseCase, HomeFiltersInput, HomeDataResponse } from '@/features/home/data/application/get-home-data-use-case';

// Infrastructure: Service wrapper for Use Cases
export interface HomeService {
  getHomeData(searchParams: any): Promise<HomeDataResponse>;
}

export class HomeServiceImpl implements HomeService {
  constructor(
    private readonly getHomeDataUseCase: GetHomeDataUseCase
  ) {}

  async getHomeData(searchParams: any): Promise<HomeDataResponse> {
    console.log('HomeService: Processing getHomeData request with searchParams:', searchParams);

    try {
      // Transform raw search params to use case input
      const input: HomeFiltersInput = this.parseSearchParams(searchParams);
      
      console.log('HomeService: Transformed to use case input:', input);

      // Execute use case
      const result = await this.getHomeDataUseCase.execute(input);
      
      console.log('HomeService: Use case executed successfully');
      return result;

    } catch (error) {
      console.error('HomeService: Error in getHomeData:', error);
      throw error; // Re-throw domain exceptions
    }
  }

  private parseSearchParams(searchParams: any): HomeFiltersInput {
    // Safe parsing of search parameters with defaults
    return {
      page: searchParams?.page,
      limit: searchParams?.limit,
      search: searchParams?.search,
      activityAreaId: searchParams?.activityAreaId, 
      neighborhoodId: searchParams?.neighborhoodId,
      hasCost: searchParams?.hasCost
    };
  }
}

// Factory function for DI container
export function createHomeService(
  getHomeDataUseCase: GetHomeDataUseCase
): HomeService {
  return new HomeServiceImpl(getHomeDataUseCase);
}

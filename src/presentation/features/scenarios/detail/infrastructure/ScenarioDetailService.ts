// Infrastructure: Scenario Detail Service (Application Service Layer)

import { 
  GetScenarioDetailUseCase, 
  GetScenarioDetailInput, 
  GetScenarioDetailResponse 
} from '@/presentation/features/scenarios/detail/application/GetScenarioDetailUseCase';

// Infrastructure: Service wrapper for Use Cases
export interface ScenarioDetailService {
  getScenarioDetail(id: string): Promise<GetScenarioDetailResponse>;
}

export class ScenarioDetailServiceImpl implements ScenarioDetailService {
  constructor(
    private readonly getScenarioDetailUseCase: GetScenarioDetailUseCase
  ) {}

  async getScenarioDetail(id: string): Promise<GetScenarioDetailResponse> {
    console.log('ScenarioDetailService: Processing getScenarioDetail request with ID:', id);

    try {
      // Transform raw ID to use case input
      const input: GetScenarioDetailInput = this.parseInput(id);
      
      console.log('ScenarioDetailService: Transformed to use case input:', input);

      // Execute use case
      const result = await this.getScenarioDetailUseCase.execute(input);
      
      console.log('ScenarioDetailService: Use case executed successfully');
      return result;

    } catch (error) {
      console.error('ScenarioDetailService: Error in getScenarioDetail:', error);
      throw error; // Re-throw domain exceptions
    }
  }

  private parseInput(id: string): GetScenarioDetailInput {
    // Safe parsing of input parameters
    return {
      id: id?.trim() || ''
    };
  }
}

// Factory function for DI container
export function createScenarioDetailService(
  getScenarioDetailUseCase: GetScenarioDetailUseCase
): ScenarioDetailService {
  return new ScenarioDetailServiceImpl(getScenarioDetailUseCase);
}

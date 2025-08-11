import { IOptionsRepository, OptionCategory } from '../domain/repositories/IOptionsRepository';

export interface OptionsDataResponse {
  categories: OptionCategory[];
}

export class GetOptionsDataUseCase {
  constructor(
    private readonly optionsRepository: IOptionsRepository
  ) {}

  async execute(): Promise<OptionsDataResponse> {
    try {
      const categories = await this.optionsRepository.getAllCategories();
      
      return { categories };

    } catch (error) {
      console.error('Error in GetOptionsDataUseCase:', error);
      throw error;
    }
  }
}

import { 
  GetOptionsDataUseCase, 
  OptionsDataResponse 
} from '../application/GetOptionsDataUseCase';

export class OptionsService {
  constructor(
    private readonly getOptionsDataUseCase: GetOptionsDataUseCase
  ) {}

  async getOptionsData(): Promise<OptionsDataResponse> {
    return await this.getOptionsDataUseCase.execute();
  }
}

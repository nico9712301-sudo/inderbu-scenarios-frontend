import { 
  GetSubScenariosDataUseCase, 
  SubScenariosFilters, 
  ISubScenariosDataResponse 
} from '../application/GetSubScenariosDataUseCase';

export class SubScenariosService {
  constructor(
    private readonly getSubScenariosDataUseCase: GetSubScenariosDataUseCase
  ) {}

  async getSubScenariosData(filters: SubScenariosFilters = {}): Promise<ISubScenariosDataResponse> {
    return await this.getSubScenariosDataUseCase.execute(filters);
  }
}

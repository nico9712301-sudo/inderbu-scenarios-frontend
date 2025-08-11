import { 
  GetSubScenariosDataUseCase, 
  ISubScenariosDataResponse 
} from '../application/GetSubScenariosDataUseCase';
import { SubScenariosFilters } from './repositories/ISubScenarioRepository';

export class SubScenariosService {
  constructor(
    private readonly getSubScenariosDataUseCase: GetSubScenariosDataUseCase
  ) {}

  async getSubScenariosData(filters: SubScenariosFilters): Promise<ISubScenariosDataResponse> {
    return await this.getSubScenariosDataUseCase.execute(filters);
  }
}

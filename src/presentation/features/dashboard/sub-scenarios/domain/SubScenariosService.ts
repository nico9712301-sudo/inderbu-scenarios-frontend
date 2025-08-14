import { 
  GetSubScenariosDataService, 
  ISubScenariosDataResponse 
} from '@/application/dashboard/sub-scenarios/services/GetSubScenariosDataService';
import { SubScenariosFilters } from './repositories/ISubScenarioRepository';

export class SubScenariosService {
  constructor(
    private readonly getSubScenariosDataService: GetSubScenariosDataService
  ) {}

  async getSubScenariosData(filters: SubScenariosFilters): Promise<ISubScenariosDataResponse> {
    return await this.getSubScenariosDataService.execute(filters);
  }
}

import {
  GetScenariosDataUseCase,
  IScenariosDataResponse,
} from "../application/GetScenariosDataUseCase";
import { IScenariosFilters } from "./repositories/IScenarioRepository";

export class ScenariosService {
  constructor(
    private readonly getScenariosDataUseCase: GetScenariosDataUseCase
  ) {}

  async getScenariosData(
    filters: IScenariosFilters = {}
  ): Promise<IScenariosDataResponse> {
    return await this.getScenariosDataUseCase.execute(filters);
  }
}

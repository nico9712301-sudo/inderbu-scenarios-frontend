import {
  GetScenariosDataUseCase,
  IScenariosDataResponse,
} from "../application/GetScenariosDataUseCase";
import { GetScenariosUseCase, PaginatedScenariosResponse } from "../application/GetScenariosUseCase";
import { GetNeighborhoodsUseCase } from "../application/GetNeighborhoodsUseCase";
import { IScenariosFilters } from "./repositories/IScenarioRepository";

export class ScenariosService {
  constructor(
    private readonly getScenariosDataUseCase: GetScenariosDataUseCase,
    private readonly getScenariosUseCase: GetScenariosUseCase,
    private readonly getNeighborhoodsUseCase: GetNeighborhoodsUseCase
  ) {}

  async getScenariosData(
    filters: IScenariosFilters = {}
  ): Promise<IScenariosDataResponse> {
    return await this.getScenariosDataUseCase.execute(filters);
  }

  async getScenarios(
    filters: IScenariosFilters = {}
  ): Promise<PaginatedScenariosResponse> {
    return await this.getScenariosUseCase.execute(filters);
  }

  async getNeighborhoods() {
    return await this.getNeighborhoodsUseCase.execute();
  }
}

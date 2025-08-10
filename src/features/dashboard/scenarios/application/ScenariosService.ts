import {
  GetScenariosDataUseCase,
  IScenariosDataResponse,
} from "./GetScenariosDataUseCase";
import { GetScenariosUseCase, PaginatedScenariosResponse } from "./GetScenariosUseCase";
import { GetNeighborhoodsUseCase } from "./GetNeighborhoodsUseCase";
import { IScenariosFilters } from "../domain/repositories/IScenarioRepository";

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

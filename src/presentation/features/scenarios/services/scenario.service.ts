import { IGetScenarioByIdResponse } from "../interfaces/get-scenario-by-id-res.interface";
import { IGetScenarioByIdRequest } from "../interfaces/get-scenario-by-id-req.interface";
import { apiClient } from "@/shared/api";

export class ScenarioService {
  static async getById({
    id,
  }: IGetScenarioByIdRequest): Promise<IGetScenarioByIdResponse> {
    const scenario: IGetScenarioByIdResponse =
      await apiClient.getItem<IGetScenarioByIdResponse>(
        `/sub-scenarios/${id}`,
        {
          cacheStrategy: "LongTerm",
        },
      );
    return this.emptyFieldsScenarioByIdMapper(scenario);
  }

  static async emptyFieldsScenarioByIdMapper(
    scenario: IGetScenarioByIdResponse,
  ): Promise<IGetScenarioByIdResponse> {
    return {
      id: scenario.id || 0,
      name: scenario.name || "Escenario sin nombre",
      hasCost: scenario.hasCost || false,
      numberOfPlayers: scenario.numberOfPlayers || 0,
      numberOfSpectators: scenario.numberOfSpectators || 0,
      recommendations:
        scenario.recommendations || "No hay recomendaciones disponibles.",
      activityArea: scenario.activityArea || { id: "1", name: "Deportes" },
      fieldSurfaceType: scenario.fieldSurfaceType || {
        id: "1",
        name: "Normal",
      },
      scenario: {
        id: scenario.scenario?.id || 0,
        name: scenario.scenario?.name || "Escenario sin nombre",
        address: scenario.scenario?.address || "Sin dirección",
        neighborhood: scenario.scenario?.neighborhood || {
          id: "1",
          name: "Centro",
        },
      },
    };
  }
}

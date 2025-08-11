import { IMetaDto, ISubScenario } from "../types/filters.types";

export interface IGetAllSubScenariosResponse {
  data: ISubScenario[];
  meta: IMetaDto;
}

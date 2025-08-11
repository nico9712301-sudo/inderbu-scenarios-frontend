import { IFilters, IMetaDto, ISubScenario } from "../types/filters.types";

export interface IUseHomeDataParams {
  initialSubScenarios: ISubScenario[];
  initialMeta: IMetaDto;
  initialFilters?: Partial<IFilters>;
  initialPage?: number;
}

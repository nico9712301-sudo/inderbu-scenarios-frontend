import { IFilters, IMetaDto, ISubScenario } from "../types/filters.types";

export interface IUseHomeDataState {
  subScenarios: ISubScenario[];
  meta: IMetaDto;
  page: number;
  filters: IFilters;
  activeFilters: string[];
  loading: boolean;
  error: string | null;
}

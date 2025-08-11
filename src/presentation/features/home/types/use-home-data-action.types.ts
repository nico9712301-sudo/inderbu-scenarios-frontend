import { IFilters, IMetaDto, ISubScenario } from "./filters.types";

export type TUseHomeDataAction =
  | { type: "SET_LOADING"; payload: boolean }
  | {
      type: "SET_DATA";
      payload: { subScenarios: ISubScenario[]; meta: IMetaDto };
    }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_FILTERS"; payload: IFilters }
  | {
      type: "SET_FILTERS_WITH_UPDATER";
      payload: (prevState: IFilters) => IFilters;
    }
  | { type: "SET_ACTIVE_FILTERS"; payload: string[] }
  | {
      type: "SET_ACTIVE_FILTERS_WITH_UPDATER";
      payload: (prevState: string[]) => string[];
    }
  | { type: "CLEAR_FILTERS" }
  | { type: "RETRY_FETCH" };

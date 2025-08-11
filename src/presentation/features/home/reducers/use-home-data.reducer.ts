import { IUseHomeDataState } from "../interfaces/use-home-data-state.interface";
import { TUseHomeDataAction } from "../types/use-home-data-action.types";

export function useHomeDataReducer(
  state: IUseHomeDataState,
  action: TUseHomeDataAction,
): IUseHomeDataState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload, error: null };
    case "SET_DATA":
      return {
        ...state,
        subScenarios: action.payload.subScenarios,
        meta: action.payload.meta,
        loading: false,
        error: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_FILTERS":
      return { ...state, filters: action.payload, page: 1 };
    case "SET_FILTERS_WITH_UPDATER":
      return { ...state, filters: action.payload(state.filters), page: 1 };
    case "SET_ACTIVE_FILTERS":
      return { ...state, activeFilters: action.payload };
    case "SET_ACTIVE_FILTERS_WITH_UPDATER":
      return { ...state, activeFilters: action.payload(state.activeFilters) };
    case "CLEAR_FILTERS":
      return {
        ...state,
        filters: { searchQuery: "" },
        activeFilters: [],
        page: 1,
      };
    case "RETRY_FETCH":
      return { ...state, error: null, loading: true };
    default:
      return state;
  }
}

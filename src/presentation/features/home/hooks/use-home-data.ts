import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { IUseHomeDataParams } from "../interfaces/use-home-data-params.interface";
import { IUseHomeDataState } from "../interfaces/use-home-data-state.interface";
import { IFilters } from "../types/filters.types";
import { useHomeDataReducer } from "../reducers/use-home-data.reducer";
import { useRouter, useSearchParams } from "next/navigation";
import { getSubScenarios } from "../services/home.service";

export function useHomeData({
  initialSubScenarios,
  initialMeta,
  initialFilters = {},
  initialPage = 1,
}: IUseHomeDataParams) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // UseRef para detectar el primer render
  const initialRender = useRef(true);

  // Usar los valores iniciales de props
  const initialState: IUseHomeDataState = {
    subScenarios: initialSubScenarios,
    meta: initialMeta,
    page: initialPage,
    filters: {
      searchQuery: "",
      ...initialFilters,
    },
    activeFilters: [],
    loading: false,
    error: null,
  };

  const [state, dispatch] = useReducer(useHomeDataReducer, initialState);

  // Sincronizar con URL cuando cambian los filtros
  useEffect(() => {
    const params = new URLSearchParams();

    if (state.page > 1) params.set("page", state.page.toString());
    if (state.filters.searchQuery)
      params.set("search", state.filters.searchQuery);
    if (state.filters.activityAreaId)
      params.set("activityAreaId", state.filters.activityAreaId.toString());
    if (state.filters.neighborhoodId)
      params.set("neighborhoodId", state.filters.neighborhoodId.toString());
    if (state.filters.hasCost !== undefined)
      params.set("hasCost", state.filters.hasCost.toString());

    const newUrl = params.toString() ? `/?${params.toString()}` : "/";
    const currentUrl = `/?${searchParams.toString()}`;

    // Solo actualizar URL si es diferente (evitar loops)
    if (newUrl !== currentUrl && newUrl !== "/?") {
      router.replace(newUrl, { scroll: false });
    }
  }, [state.page, state.filters, router, searchParams]);

  // Función para fetch de datos
  const fetchSubScenarios = useCallback(
    async (page: number, filters: IFilters, limit: number) => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        // CAMBIO: Mapear IFilters a la interfaz del service
        const { data, meta } = await getSubScenarios({
          page,
          limit,
          searchQuery: filters.searchQuery || "",
          activityAreaId: filters.activityAreaId || 0,
          neighborhoodId: filters.neighborhoodId || 0,
          hasCost: filters.hasCost,
        });

        dispatch({
          type: "SET_DATA",
          payload: { subScenarios: data, meta },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al cargar los escenarios";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        console.error("Error fetching sub scenarios:", error);
      }
    },
    []
  );

  // Effect para fetch SOLO en renders subsecuentes (NO en primer render)
  useEffect(() => {
    // Evitar fetch en el primer render (datos ya vienen del SSR)
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    // Solo hacer fetch si ya pasó el primer render
    fetchSubScenarios(state.page, state.filters, initialMeta.limit);
  }, [state.page, state.filters, fetchSubScenarios, initialMeta.limit]);

  // Handlers
  const setPage = useCallback((newPage: number) => {
    dispatch({ type: "SET_PAGE", payload: newPage });
  }, []);

  const setFilters: Dispatch<SetStateAction<IFilters>> = useCallback(
    (filtersOrUpdater) => {
      if (typeof filtersOrUpdater === "function") {
        dispatch({
          type: "SET_FILTERS_WITH_UPDATER",
          payload: filtersOrUpdater,
        });
      } else {
        dispatch({ type: "SET_FILTERS", payload: filtersOrUpdater });
      }
    },
    []
  );

  const setActiveFilters: Dispatch<SetStateAction<string[]>> = useCallback(
    (activeFiltersOrUpdater) => {
      if (typeof activeFiltersOrUpdater === "function") {
        dispatch({
          type: "SET_ACTIVE_FILTERS_WITH_UPDATER",
          payload: activeFiltersOrUpdater,
        });
      } else {
        dispatch({
          type: "SET_ACTIVE_FILTERS",
          payload: activeFiltersOrUpdater,
        });
      }
    },
    []
  );

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
  }, []);

  const retryFetch = useCallback(() => {
    dispatch({ type: "RETRY_FETCH" });
    fetchSubScenarios(state.page, state.filters, initialMeta.limit);
  }, [state.page, state.filters, fetchSubScenarios, initialMeta.limit]);

  // Computed values
  const hasError = Boolean(state.error);
  const hasData = state.subScenarios.length > 0;
  const isEmpty = !state.loading && !hasError && !hasData;

  return {
    // State
    subScenarios: state.subScenarios,
    meta: state.meta,
    page: state.page,
    filters: state.filters,
    activeFilters: state.activeFilters,
    loading: state.loading,
    error: state.error,

    // Computed
    hasError,
    hasData,
    isEmpty,

    // Actions
    setPage,
    setFilters,
    setActiveFilters,
    clearFilters,
    retryFetch,
  };
}

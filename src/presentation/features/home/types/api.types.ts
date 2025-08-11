export interface IActivityAreaData {
  id: number | string;
  name: string;
}

export interface INeighborhoodData {
  id: number | string;
  name: string;
}

export interface ISubScenarioData {
  id: number;
  name: string;
  hasCost: boolean;
  numberOfSpectators: number;
  numberOfPlayers: number;
  recommendations: string;
  scenario: {
    id: number;
    name: string;
    address: string;
    neighborhood: { id: number; name: string };
  };
  activityArea: { id: number; name: string };
  fieldSurfaceType: { id: number; name: string };
}

// Tipos para búsqueda (compatibilidad con search.service.ts)
export interface IActivityAreaOption {
  id: number;
  name: string;
}

export interface INeighborhoodOption {
  id: number;
  name: string;
}

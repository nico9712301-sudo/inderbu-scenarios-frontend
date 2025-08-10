const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Función para agregar token de autenticación a los headers
const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Agregar token de autenticación si existe
  const token = localStorage.getItem("auth_token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Función para construir URL con parámetros de consulta
const buildUrl = (endpoint: string, params?: Record<string, any>): string => {
  const url = new URL(`${API_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
  }

  return url.toString();
};

// Función base para realizar peticiones
const fetchApi = async <T>(
  endpoint: string,
  options?: RequestInit,
  params?: Record<string, any>,
): Promise<T> => {
  const url = buildUrl(endpoint, params);

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options?.headers || {}),
    },
  };

  try {
    const response = await fetch(url, fetchOptions);

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          `Error ${response.status}: ${response.statusText}`,
      );
    }

    // Parsear respuesta como JSON
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Interfaces

export interface PageOptions {
  page?: number;
  limit?: number;
  search?: string;
  activityAreaId?: number;
  neighborhoodId?: number;
  scenarioId?: number;
  active?: boolean;
}

export interface PageMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PagedResponse<T> {
  data: T[];
  meta: PageMeta;
}

export interface Commune {
  id: number;
  name: string;
  city?: {
    id: number;
    name: string;
  };
}

export interface Neighborhood {
  id: number;
  name: string;
  commune?: Commune;
}

export interface ActivityArea {
  id: number;
  name: string;
}

export interface Scenario {
  id: number;
  name: string;
  address: string;
  neighborhood?: Neighborhood;
  description?: string;
  active: boolean;
}

// DTOs para Communes
export interface CreateCommuneDto {
  name: string;
  cityId: number;
}

export interface UpdateCommuneDto {
  name?: string;
  cityId?: number;
}

// DTOs para Neighborhoods
export interface CreateNeighborhoodDto {
  name: string;
  communeId: number;
}

export interface UpdateNeighborhoodDto {
  name?: string;
  communeId?: number;
}

// DTOs para Scenarios
export interface CreateScenarioDto {
  name: string;
  address: string;
  neighborhoodId: number;
}

export interface UpdateScenarioDto {
  name?: string;
  address?: string;
  neighborhoodId?: number;
  isActive?: boolean;
}

// DTOs para SubScenarios
export interface CreateSubScenarioDto {
  name: string;
  active?: boolean;
  hasCost?: boolean;
  numberOfSpectators?: number;
  numberOfPlayers?: number;
  recommendations?: string;
  scenarioId: number;
  activityAreaId?: number;
  fieldSurfaceTypeId?: number;
}

export interface UpdateSubScenarioDto {
  name?: string;
  active?: boolean;
  hasCost?: boolean;
  numberOfSpectators?: number;
  numberOfPlayers?: number;
  recommendations?: string;
  activityAreaId?: number;
  fieldSurfaceTypeId?: number;
}

export interface FieldSurfaceType {
  id: number;
  name: string;
}

export interface SubScenarioImage {
  id: number;
  path: string; // Ruta relativa de la imagen (/uploads/images/...)
  url?: string; // URL completa (para compatibilidad)
  isFeature: boolean;
  displayOrder: number;
  subScenarioId: number;
  createdAt?: string | Date;
}

export interface SubScenarioImageGallery {
  featured?: SubScenarioImage;
  additional: SubScenarioImage[];
  count: number;
}

// Ahora actualizemos la interfaz SubScenario
export interface SubScenario {
  id: number;
  name: string;
  active: boolean;
  hasCost: boolean;
  numberOfSpectators?: number;
  numberOfPlayers?: number;
  recommendations?: string;
  createdAt?: string; // o Date si prefieres parsearla

  // IDs de relaciones
  scenarioId?: number;
  activityAreaId?: number;
  fieldSurfaceTypeId?: number;

  // Objetos de relaciones
  scenario?: Scenario;
  activityArea?: ActivityArea;
  fieldSurfaceType?: FieldSurfaceType;

  // Imágenes asociadas
  imageGallery?: SubScenarioImageGallery;
  images?: SubScenarioImage[];
}
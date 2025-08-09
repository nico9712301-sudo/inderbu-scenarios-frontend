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
  createdAt: string; // o Date si prefieres parsearla

  // IDs de relaciones
  scenarioId: number;
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

// Tipo para manejar tanto respuestas paginadas como arrays simples
export type ApiResponse<T> = T[] | PagedResponse<T>;

// Servicios para Communes
export const communeService = {
  getAll: async (options: PageOptions = {}): Promise<ApiResponse<Commune>> => {
    // Si no hay parámetros, devolver array simple
    if (!options.page && !options.limit && !options.search) {
      return fetchApi<Commune[]>("/communes", { method: "GET" });
    }
    // Con parámetros, devolver respuesta paginada
    return fetchApi<PagedResponse<Commune>>(
      "/communes",
      { method: "GET" },
      options,
    );
  },
  getById: async (id: number): Promise<Commune> => {
    return fetchApi<Commune>(`/communes/${id}`, { method: "GET" });
  },
  create: async (data: CreateCommuneDto): Promise<Commune> => {
    return fetchApi<Commune>("/communes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: UpdateCommuneDto): Promise<Commune> => {
    return fetchApi<Commune>(`/communes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(`/communes/${id}`, { method: "DELETE" });
  },
};

// Servicios para Scenarios
export const scenarioService = {
  getAll: async (
    options: PageOptions = {},
  ): Promise<PagedResponse<Scenario>> => {
    return fetchApi<PagedResponse<Scenario>>(
      "/scenarios",
      { method: "GET" },
      options,
    );
  },
  getById: async (id: number): Promise<Scenario> => {
    return fetchApi<Scenario>(`/scenarios/${id}`, { method: "GET" });
  },
  create: async (data: CreateScenarioDto): Promise<Scenario> => {
    return fetchApi<Scenario>("/scenarios", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: UpdateScenarioDto): Promise<Scenario> => {
    return fetchApi<Scenario>(`/scenarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(`/scenarios/${id}`, { method: "DELETE" });
  },
};

// Servicios para Sub-Scenarios
export const subScenarioService = {
  getAll: async (
    options: PageOptions = {},
  ): Promise<PagedResponse<SubScenario>> => {
    return fetchApi<PagedResponse<SubScenario>>(
      "/sub-scenarios",
      { method: "GET" },
      options,
    );
  },
  getById: async (id: number): Promise<SubScenario> => {
    return fetchApi<SubScenario>(`/sub-scenarios/${id}`, { method: "GET" });
  },
  create: async (data: CreateSubScenarioDto, images?: File[]): Promise<SubScenario> => {
    // Si hay imágenes, usar FormData; si no, usar JSON
    if (images && images.length > 0) {
      const formData = new FormData();
      
      // Agregar campos del DTO asegurando tipos correctos
      formData.append('name', data.name);
      formData.append('active', String(data.active ?? false));
      formData.append('hasCost', String(data.hasCost ?? false));
      formData.append('numberOfSpectators', String(data.numberOfSpectators ?? 0));
      formData.append('numberOfPlayers', String(data.numberOfPlayers ?? 0));
      formData.append('scenarioId', String(data.scenarioId));
      
      if (data.recommendations) {
        formData.append('recommendations', data.recommendations);
      }
      
      if (data.activityAreaId !== undefined) {
        formData.append('activityAreaId', String(data.activityAreaId));
      }
      
      if (data.fieldSurfaceTypeId !== undefined) {
        formData.append('fieldSurfaceTypeId', String(data.fieldSurfaceTypeId));
      }
      
      // Agregar imágenes
      images.forEach((image) => {
        formData.append('images', image);
      });
      
      // Usar fetch directamente para FormData (sin Content-Type)
      const url = `${API_URL}/sub-scenarios`;
      const headers: HeadersInit = {};
      
      // Agregar token de autenticación si existe
      const token = localStorage.getItem("auth_token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Error ${response.status}: ${response.statusText}`,
        );
      }
      
      return await response.json();
    } else {
      // Sin imágenes, usar JSON normal
      return fetchApi<SubScenario>("/sub-scenarios", {
        method: "POST",
        body: JSON.stringify(data),
      });
    }
  },
  update: async (
    id: number,
    data: UpdateSubScenarioDto,
  ): Promise<SubScenario> => {
    return fetchApi<SubScenario>(`/sub-scenarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(`/sub-scenarios/${id}`, { method: "DELETE" });
  },
  getImages: async (subScenarioId: number): Promise<SubScenarioImage[]> => {
    return fetchApi<SubScenarioImage[]>(
      `/sub-scenarios/${subScenarioId}/images`,
      { method: "GET" },
    );
  },
  uploadImages: async (
    subScenarioId: number,
    formData: FormData,
  ): Promise<SubScenarioImage[]> => {
    // Esta función no utiliza fetchApi porque necesitamos manejar formData para subir archivos
    const url = `${API_URL}/sub-scenarios/${subScenarioId}/images`;

    // Para FormData no debemos establecer el Content-Type, el navegador lo hará automáticamente
    const headers: HeadersInit = {};

    // Agregar token de autenticación si existe
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

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
    return data;
  },
};

// Servicios para Activity Areas
export const activityAreaService = {
  getAll: async (
    options: PageOptions = {},
  ): Promise<ApiResponse<ActivityArea>> => {
    return fetchApi<ApiResponse<ActivityArea>>(
      "/activity-areas",
      { method: "GET" },
      options,
    );
  },
};

// Servicios para Neighborhoods (actualizado con CRUD)
export const neighborhoodService = {
  getAll: async (
    options: PageOptions = {},
  ): Promise<ApiResponse<Neighborhood>> => {
    // Si no hay parámetros, devolver array simple
    if (!options.page && !options.limit && !options.search) {
      return fetchApi<Neighborhood[]>("/neighborhoods", { method: "GET" });
    }
    // Con parámetros, devolver respuesta paginada
    return fetchApi<PagedResponse<Neighborhood>>(
      "/neighborhoods",
      { method: "GET" },
      options,
    );
  },
  getById: async (id: number): Promise<Neighborhood> => {
    return fetchApi<Neighborhood>(`/neighborhoods/${id}`, { method: "GET" });
  },
  create: async (data: CreateNeighborhoodDto): Promise<Neighborhood> => {
    return fetchApi<Neighborhood>("/neighborhoods", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (
    id: number,
    data: UpdateNeighborhoodDto,
  ): Promise<Neighborhood> => {
    return fetchApi<Neighborhood>(`/neighborhoods/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(`/neighborhoods/${id}`, { method: "DELETE" });
  },
};

// Métodos CRUD genéricos para futura extensión
export const apiService = {
  get: async <T>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<T> => {
    return fetchApi<T>(endpoint, { method: "GET" }, params);
  },

  post: async <T>(endpoint: string, data: any): Promise<T> => {
    return fetchApi<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  put: async <T>(endpoint: string, data: any): Promise<T> => {
    return fetchApi<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  patch: async <T>(endpoint: string, data: any): Promise<T> => {
    return fetchApi<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    return fetchApi<T>(endpoint, { method: "DELETE" });
  },
};

export default apiService;

// Servicios específicos para imágenes de sub-escenarios
export const subScenarioImageService = {
  // Obtiene todas las imágenes de un sub-escenario
  getBySubScenarioId: async (
    subScenarioId: number,
  ): Promise<SubScenarioImage[]> => {
    return fetchApi<SubScenarioImage[]>(
      `/sub-scenarios/${subScenarioId}/images`,
      { method: "GET" },
    );
  },

  // Actualiza una imagen específica (para cambiar si es destacada o su orden)
  updateImage: async (
    subScenarioId: number,
    imageId: number,
    data: { isFeature?: boolean; displayOrder?: number },
  ): Promise<SubScenarioImage> => {
    return fetchApi<SubScenarioImage>(
      `/sub-scenarios/${subScenarioId}/images/${imageId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
  },

  // Sube múltiples imágenes
  uploadMultiple: async (
    subScenarioId: number,
    files: File[],
    isFeatureIndexes: number[] = [],
  ): Promise<SubScenarioImage[]> => {
    const formData = new FormData();

    // Agregar archivos al FormData
    files.forEach((file, index) => {
      formData.append("files", file);

      // Determinar si esta imagen es destacada
      const isFeature = isFeatureIndexes.includes(index);
      formData.append("isFeature", isFeature.toString());
    });

    // Usar la misma lógica de uploadImages en subScenarioService
    return subScenarioService.uploadImages(subScenarioId, formData);
  },

  // Sube una sola imagen
  uploadSingle: async (
    subScenarioId: number,
    file: File,
    isFeature: boolean = false,
  ): Promise<SubScenarioImage> => {
    const formData = new FormData();
    formData.append("files", file);
    formData.append("isFeature", isFeature.toString());

    const images = await subScenarioService.uploadImages(
      subScenarioId,
      formData,
    );
    return images[0]; // Devolver la primera (y única) imagen subida
  },

  // Establece una imagen como destacada y las demás como no destacadas
  setAsFeature: async (
    subScenarioId: number,
    imageId: number,
  ): Promise<SubScenarioImage> => {
    return subScenarioImageService.updateImage(subScenarioId, imageId, {
      isFeature: true,
    });
  },
};

// Funciones utilitarias para trabajar con imágenes
export const imageUtils = {
  // Obtiene la imagen destacada de un sub-escenario
  getFeatureImage: (
    subScenario?: SubScenario,
  ): SubScenarioImage | undefined => {
    return subScenario?.imageGallery?.featured;
  },

  // Obtiene la URL de la imagen destacada, o una imagen por defecto si no hay
  getFeatureImageUrl: (
    subScenario?: SubScenario,
    defaultImage: string = "/placeholder.jpg",
  ): string => {
    const featured = subScenario?.imageGallery?.featured;
    if (featured?.path) {
      return `${API_URL}${featured.path}`;
    }
    return defaultImage;
  },

  // Obtiene la URL completa de una imagen
  getImageUrl: (imagePath?: string): string => {
    if (!imagePath) return "/placeholder.jpg";
    return `${API_URL}${imagePath}`;
  },

  // Comprueba si un sub-escenario tiene imágenes
  hasImages: (subScenario?: SubScenario): boolean => {
    return (
      !!subScenario?.imageGallery?.count && subScenario.imageGallery.count > 0
    );
  },

  // Obtiene el número de imágenes de un sub-escenario
  getImageCount: (subScenario?: SubScenario): number => {
    return subScenario?.imageGallery?.count || 0;
  },
};

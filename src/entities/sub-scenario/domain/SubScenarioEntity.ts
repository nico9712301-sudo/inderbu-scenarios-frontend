export interface SubScenarioPlainObject {
  id?: number;
  name: string;
  hasCost: boolean;
  numberOfSpectators: number;
  numberOfPlayers: number;
  recommendations: string;
  active: boolean;
  scenario: {
    id: number;
    name: string;
    address: string;
    neighborhood?: { id: number; name: string };
  };
  activityArea: { id: number; name: string };
  fieldSurfaceType: { id: number; name: string };
  imageGallery?: {
    additional: any[];
    count: number;
    featured?: {
      createdAt: string;
      displayOrder: number;
      id: number;
      isFeature: boolean;
      path: string;
      subScenarioId: number;
      url: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}
export class SubScenarioDomainError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'SubScenarioDomainError';
  }
}

export class SubScenarioEntity {
  public readonly id?: number; // Ahora es opcional
  public readonly name: string;
  public readonly hasCost: boolean;
  public readonly numberOfSpectators: number;
  public readonly numberOfPlayers: number;
  public readonly recommendations: string;
  public active: boolean;
  public readonly scenario: {
    id: number;
    name: string;
    address: string;
    neighborhood?: { id: number; name: string };
  };
  public readonly activityArea: { id: number; name: string };
  public readonly fieldSurfaceType: { id: number; name: string };
  public readonly imageGallery?: {
    additional: any[];
    count: number;
    featured?: {
      createdAt: string;
      displayOrder: number;
      id: number;
      isFeature: boolean;
      path: string;
      subScenarioId: number;
      url: string;
      current: boolean;
    };
  };
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(
    name: string,
    hasCost: boolean,
    numberOfSpectators: number,
    numberOfPlayers: number,
    recommendations: string,
    active: boolean,
    scenario: {
      id: number;
      name: string;
      address: string;
      neighborhood?: { id: number; name: string };
    },
    activityArea: { id: number; name: string },
    fieldSurfaceType: { id: number; name: string },
    imageGallery?: {
      additional: any[];
      count: number;
      featured?: {
        createdAt: string;
        displayOrder: number;
        id: number;
        isFeature: boolean;
        path: string;
        subScenarioId: number;
        url: string;
      };
    },
    createdAt?: Date,
    updatedAt?: Date,
    id?: number // ID opcional al final del constructor
  ) {
    // Domain validation
    if (id !== undefined && id <= 0) {
      throw new SubScenarioDomainError('SubScenario ID must be positive when provided');
    }
    if (!name || name.trim().length === 0) {
      throw new SubScenarioDomainError('SubScenario name cannot be empty');
    }
    if (name.length > 255) {
      throw new SubScenarioDomainError('SubScenario name cannot exceed 255 characters');
    }
    if (numberOfSpectators < 0) {
      throw new SubScenarioDomainError('Number of spectators cannot be negative');
    }
    if (numberOfPlayers < 0) {
      throw new SubScenarioDomainError('Number of players cannot be negative');
    }
    if (recommendations && recommendations.length > 2000) {
      throw new SubScenarioDomainError('Recommendations cannot exceed 2000 characters');
    }
    if (!scenario || scenario.id <= 0) {
      throw new SubScenarioDomainError('Valid scenario is required');
    }
    if (!activityArea || activityArea.id <= 0) {
      throw new SubScenarioDomainError('Valid activity area is required');
    }
    if (!fieldSurfaceType || fieldSurfaceType.id <= 0) {
      throw new SubScenarioDomainError('Valid field surface type is required');
    }

    this.id = id;
    this.name = name.trim();
    this.hasCost = hasCost;
    this.numberOfSpectators = numberOfSpectators;
    this.numberOfPlayers = numberOfPlayers;
    this.recommendations = recommendations?.trim() || '';
    this.active = active;
    this.scenario = scenario;
    this.activityArea = activityArea;
    this.fieldSurfaceType = fieldSurfaceType;
    this.imageGallery = imageGallery;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Factory method from API data
  static fromApiData(apiData: any): SubScenarioEntity {
    if (!SubScenarioEntity.isValidApiData(apiData)) {
      throw new SubScenarioDomainError(`Invalid sub-scenario API data: ${JSON.stringify(apiData)}`);
    }

    return new SubScenarioEntity(
      apiData.name,
      Boolean(apiData.hasCost),
      Number(apiData.numberOfSpectators) || 0,
      Number(apiData.numberOfPlayers) || 0,
      apiData.recommendations || '',
      Boolean(apiData.active !== undefined ? apiData.active : true),
      {
        id: apiData.scenario.id,
        name: apiData.scenario.name,
        address: apiData.scenario.address,
        neighborhood: apiData.scenario.neighborhood ? {
          id: apiData.scenario.neighborhood.id,
          name: apiData.scenario.neighborhood.name,
        } : undefined,
      },
      {
        id: apiData.activityArea.id,
        name: apiData.activityArea.name,
      },
      {
        id: apiData.fieldSurfaceType.id,
        name: apiData.fieldSurfaceType.name,
      },
      apiData.imageGallery,
      apiData.createdAt ? new Date(apiData.createdAt) : undefined,
      apiData.updatedAt ? new Date(apiData.updatedAt) : undefined,
      apiData.id // ID opcional al final
    );
  }

  // Nuevo factory method para crear sin ID (útil para nuevas entidades)
  static create(data: {
    name: string;
    hasCost: boolean;
    numberOfSpectators: number;
    numberOfPlayers: number;
    recommendations: string;
    active: boolean;
    scenario: {
      id: number;
      name: string;
      address: string;
      neighborhood?: { id: number; name: string };
    };
    activityArea: { id: number; name: string };
    fieldSurfaceType: { id: number; name: string };
    imageGallery?: any;
  }): SubScenarioEntity {
    return new SubScenarioEntity(
      data.name,
      data.hasCost,
      data.numberOfSpectators,
      data.numberOfPlayers,
      data.recommendations,
      data.active,
      data.scenario,
      data.activityArea,
      data.fieldSurfaceType,
      data.imageGallery
    );
  }

  // Factory method from array
  static fromApiDataArray(apiDataArray: any[]): SubScenarioEntity[] {
    if (!Array.isArray(apiDataArray)) {
      throw new SubScenarioDomainError('Expected array of sub-scenario API data');
    }
    
    return apiDataArray.map(apiData => SubScenarioEntity.fromApiData(apiData));
  }

  // Business logic methods
  isActive(): boolean {
    return this.active;
  }

  isFree(): boolean {
    return !this.hasCost;
  }

  isPaid(): boolean {
    return this.hasCost;
  }

  hasImages(): boolean {
    return Boolean(this.imageGallery && this.imageGallery.count > 0);
  }

  // Método para actualizar el estado activo (DDD approach)
  updateActiveStatus(newActiveStatus: boolean): void {
    // Validar invariantes de negocio si aplica
    // Por ejemplo: "No se puede desactivar si hay reservas activas"
    // if (!newActiveStatus && this.hasActiveReservations()) {
    //   throw new SubScenarioDomainError('Cannot deactivate sub-scenario with active reservations');
    // }
    
    this.active = newActiveStatus;
  }

  getFeaturedImage(): string | null {
    if (this.imageGallery?.featured?.url) {
      return this.imageGallery.featured.url;
    }
    return null;
  }

  getCapacityInfo(): string {
    if (this.numberOfPlayers > 0 && this.numberOfSpectators > 0) {
      return `${this.numberOfPlayers} players, ${this.numberOfSpectators} spectators`;
    } else if (this.numberOfPlayers > 0) {
      return `${this.numberOfPlayers} players`;
    } else if (this.numberOfSpectators > 0) {
      return `${this.numberOfSpectators} spectators`;
    }
    return 'Capacity not specified';
  }

  matchesSearchQuery(query: string): boolean {
    if (!query || query.trim().length === 0) {
      return true;
    }

    const searchTerm = query.toLowerCase();
    const nameMatch = this.name.toLowerCase().includes(searchTerm);
    const recommendationsMatch = this.recommendations.toLowerCase().includes(searchTerm);
    const scenarioMatch = this.scenario.name.toLowerCase().includes(searchTerm);
    const activityAreaMatch = this.activityArea.name.toLowerCase().includes(searchTerm);
    const fieldSurfaceTypeMatch = this.fieldSurfaceType.name.toLowerCase().includes(searchTerm);

    return nameMatch || recommendationsMatch || scenarioMatch || activityAreaMatch || fieldSurfaceTypeMatch;
  }

  belongsToScenario(scenarioId: number): boolean {
    return this.scenario.id === scenarioId;
  }

  belongsToActivityArea(activityAreaId: number): boolean {
    return this.activityArea.id === activityAreaId;
  }

  hasFieldSurfaceType(fieldSurfaceTypeId: number): boolean {
    return this.fieldSurfaceType.id === fieldSurfaceTypeId;
  }

  // Método para verificar si es una nueva entidad
  isNewEntity(): boolean {
    return this.id === undefined;
  }

  // Método para crear una copia con ID (útil después de guardar en BD)
  withId(id: number): SubScenarioEntity {
    if (id <= 0) {
      throw new SubScenarioDomainError('ID must be positive');
    }
    
    return new SubScenarioEntity(
      this.name,
      this.hasCost,
      this.numberOfSpectators,
      this.numberOfPlayers,
      this.recommendations,
      this.active,
      this.scenario,
      this.activityArea,
      this.fieldSurfaceType,
      this.imageGallery,
      this.createdAt,
      this.updatedAt,
      id
    );
  }

  // Serialization for Next.js Client Components
  toPlainObject(): SubScenarioPlainObject {
    return {
      id: this.id, // Optional id, undefined for entities without ID (DDD compliant)
      name: this.name,
      hasCost: this.hasCost,
      numberOfSpectators: this.numberOfSpectators,
      numberOfPlayers: this.numberOfPlayers,
      recommendations: this.recommendations,
      active: this.active,
      scenario: this.scenario,
      activityArea: this.activityArea,
      fieldSurfaceType: this.fieldSurfaceType,
      imageGallery: this.imageGallery,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
    };
  }

  // Convert to API format for backend calls
  toApiFormat(): any {
    const apiFormat: any = {
      name: this.name,
      hasCost: this.hasCost,
      numberOfSpectators: this.numberOfSpectators,
      numberOfPlayers: this.numberOfPlayers,
      recommendations: this.recommendations,
      active: this.active,
      scenarioId: this.scenario.id,
      activityAreaId: this.activityArea.id,
      fieldSurfaceTypeId: this.fieldSurfaceType.id,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
    };

    // Solo incluir ID si existe
    if (this.id !== undefined) {
      apiFormat.id = this.id;
    }

    return apiFormat;
  }

  // Validation helpers
  private static isValidApiData(apiData: any): boolean {
    return (
      apiData &&
      typeof apiData === 'object' &&
      // ID ya no es requerido
      (apiData.id === undefined || (typeof apiData.id === 'number' && apiData.id > 0)) &&
      typeof apiData.name === 'string' &&
      apiData.name.trim().length > 0 &&
      typeof apiData.hasCost === 'boolean' &&
      // Recommendations can be string or undefined
      (apiData.recommendations === undefined || typeof apiData.recommendations === 'string') &&
      apiData.scenario &&
      typeof apiData.scenario.id === 'number' &&
      apiData.scenario.id > 0 &&
      apiData.activityArea &&
      typeof apiData.activityArea.id === 'number' &&
      apiData.activityArea.id > 0 &&
      apiData.fieldSurfaceType &&
      typeof apiData.fieldSurfaceType.id === 'number' &&
      apiData.fieldSurfaceType.id > 0
    );
  }
}
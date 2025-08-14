// Domain Entity: SubScenario
import { ScenarioEntity } from '@/entities/scenario/domain/ScenarioEntity';
import { ActivityAreaEntity } from '@/entities/activity-area/domain/ActivityAreaEntity';
import { FieldSurfaceTypeEntity } from '@/entities/field-surface-type/domain/FieldSurfaceTypeEntity';

export interface SubScenarioPlainObject {
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

export interface SubScenarioSearchCriteria {
  searchQuery?: string;
  scenarioId?: number;
  activityAreaId?: number;
  fieldSurfaceTypeId?: number;
  hasCost?: boolean;
  active?: boolean;
  limit?: number;

  isValid(): boolean;
}

export class SubScenarioSearchCriteria {
  constructor(
    public readonly searchQuery?: string,
    public readonly scenarioId?: number,
    public readonly activityAreaId?: number,
    public readonly fieldSurfaceTypeId?: number,
    public readonly hasCost?: boolean,
    public readonly active?: boolean,
    public readonly limit?: number
  ) {}

  isValid(): boolean {
    if (this.limit !== undefined && (this.limit <= 0 || this.limit > 1000)) {
      return false;
    }
    if (this.scenarioId !== undefined && this.scenarioId <= 0) {
      return false;
    }
    if (this.activityAreaId !== undefined && this.activityAreaId <= 0) {
      return false;
    }
    if (this.fieldSurfaceTypeId !== undefined && this.fieldSurfaceTypeId <= 0) {
      return false;
    }
    if (this.searchQuery && this.searchQuery.length > 200) {
      return false;
    }
    return true;
  }
}

export class SubScenarioDomainError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'SubScenarioDomainError';
  }
}

export class SubScenarioEntity {
  public readonly id: number;
  public readonly name: string;
  public readonly hasCost: boolean;
  public readonly numberOfSpectators: number;
  public readonly numberOfPlayers: number;
  public readonly recommendations: string;
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
    };
  };
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(
    id: number,
    name: string,
    hasCost: boolean,
    numberOfSpectators: number,
    numberOfPlayers: number,
    recommendations: string,
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
    updatedAt?: Date
  ) {
    // Domain validation
    if (id <= 0) {
      throw new SubScenarioDomainError('SubScenario ID must be positive');
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
      apiData.id,
      apiData.name,
      Boolean(apiData.hasCost),
      Number(apiData.numberOfSpectators) || 0,
      Number(apiData.numberOfPlayers) || 0,
      apiData.recommendations || '',
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
      apiData.updatedAt ? new Date(apiData.updatedAt) : undefined
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
    return true; // Assuming all sub-scenarios are active if they exist
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

  // Serialization for Next.js Client Components
  toPlainObject(): SubScenarioPlainObject {
    return {
      id: this.id,
      name: this.name,
      hasCost: this.hasCost,
      numberOfSpectators: this.numberOfSpectators,
      numberOfPlayers: this.numberOfPlayers,
      recommendations: this.recommendations,
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
    return {
      id: this.id,
      name: this.name,
      hasCost: this.hasCost,
      numberOfSpectators: this.numberOfSpectators,
      numberOfPlayers: this.numberOfPlayers,
      recommendations: this.recommendations,
      scenarioId: this.scenario.id,
      activityAreaId: this.activityArea.id,
      fieldSurfaceTypeId: this.fieldSurfaceType.id,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
    };
  }

  // Validation helpers
  private static isValidApiData(apiData: any): boolean {
    return (
      apiData &&
      typeof apiData === 'object' &&
      typeof apiData.id === 'number' &&
      apiData.id > 0 &&
      typeof apiData.name === 'string' &&
      apiData.name.trim().length > 0 &&
      typeof apiData.hasCost === 'boolean' &&
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
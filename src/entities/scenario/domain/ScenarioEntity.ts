// Domain Entity: Scenario
import { NeighborhoodEntity } from '@/entities/neighborhood/domain/NeighborhoodEntity';

export interface ScenarioPlainObject {
  id: number;
  name: string;
  address: string;
  description?: string;
  active: boolean;
  neighborhoodId?: number;
  neighborhood?: {
    id: number;
    name: string;
    communeId?: number;
    communeName?: string;
    cityId?: number;
    cityName?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ScenarioSearchCriteria {
  searchQuery?: string;
  neighborhoodId?: number;
  active?: boolean;
  limit?: number;

  isValid(): boolean;
}

export class ScenarioSearchCriteria {
  constructor(
    public readonly searchQuery?: string,
    public readonly neighborhoodId?: number,
    public readonly active?: boolean,
    public readonly limit?: number
  ) {}

  isValid(): boolean {
    if (this.limit !== undefined && (this.limit <= 0 || this.limit > 1000)) {
      return false;
    }
    if (this.neighborhoodId !== undefined && this.neighborhoodId <= 0) {
      return false;
    }
    if (this.searchQuery && this.searchQuery.length > 200) {
      return false;
    }
    return true;
  }
}

export class ScenarioDomainError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'ScenarioDomainError';
  }
}

export class ScenarioEntity {
  public readonly id: number;
  public readonly name: string;
  public readonly address: string;
  public readonly description?: string;
  public readonly active: boolean;
  public readonly neighborhoodId?: number;
  public readonly neighborhood?: NeighborhoodEntity;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(
    id: number,
    name: string,
    address: string,
    active: boolean,
    description?: string,
    neighborhoodId?: number,
    neighborhood?: NeighborhoodEntity,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    // Domain validation
    if (id <= 0) {
      throw new ScenarioDomainError('Scenario ID must be positive');
    }
    if (!name || name.trim().length === 0) {
      throw new ScenarioDomainError('Scenario name cannot be empty');
    }
    if (name.length > 255) {
      throw new ScenarioDomainError('Scenario name cannot exceed 255 characters');
    }
    if (!address || address.trim().length === 0) {
      throw new ScenarioDomainError('Scenario address cannot be empty');
    }
    if (address.length > 500) {
      throw new ScenarioDomainError('Scenario address cannot exceed 500 characters');
    }
    if (description && description.length > 2000) {
      throw new ScenarioDomainError('Scenario description cannot exceed 2000 characters');
    }

    this.id = id;
    this.name = name.trim();
    this.address = address.trim();
    this.description = description?.trim();
    this.active = active;
    this.neighborhoodId = neighborhoodId;
    this.neighborhood = neighborhood;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Factory method from API data
  static fromApiData(apiData: any): ScenarioEntity {
    if (!ScenarioEntity.isValidApiData(apiData)) {
      throw new ScenarioDomainError(`Invalid scenario API data: ${JSON.stringify(apiData)}`);
    }

    let neighborhood: NeighborhoodEntity | undefined;
    if (apiData.neighborhood) {
      try {
        neighborhood = NeighborhoodEntity.fromApiData(apiData.neighborhood);
      } catch (error) {
        console.warn('ScenarioEntity: Could not parse neighborhood data:', error);
      }
    }

    return new ScenarioEntity(
      apiData.id,
      apiData.name,
      apiData.address,
      Boolean(apiData.active),
      apiData.description,
      apiData.neighborhoodId,
      neighborhood,
      apiData.createdAt ? new Date(apiData.createdAt) : undefined,
      apiData.updatedAt ? new Date(apiData.updatedAt) : undefined
    );
  }

  // Factory method from array
  static fromApiDataArray(apiDataArray: any[]): ScenarioEntity[] {
    if (!Array.isArray(apiDataArray)) {
      throw new ScenarioDomainError('Expected array of scenario API data');
    }
    
    return apiDataArray.map(apiData => ScenarioEntity.fromApiData(apiData));
  }

  // Business logic methods
  isActive(): boolean {
    return this.active;
  }

  hasNeighborhood(): boolean {
    return Boolean(this.neighborhoodId && this.neighborhood);
  }

  getFullAddress(): string {
    if (this.hasNeighborhood() && this.neighborhood) {
      return `${this.address}, ${this.neighborhood.getFullName()}`;
    }
    return this.address;
  }

  matchesSearchQuery(query: string): boolean {
    if (!query || query.trim().length === 0) {
      return true;
    }

    const searchTerm = query.toLowerCase();
    const nameMatch = this.name.toLowerCase().includes(searchTerm);
    const addressMatch = this.address.toLowerCase().includes(searchTerm);
    const descriptionMatch = this.description?.toLowerCase().includes(searchTerm) || false;

    return nameMatch || addressMatch || descriptionMatch;
  }

  isInNeighborhood(neighborhoodId: number): boolean {
    return this.neighborhoodId === neighborhoodId;
  }

  // Serialization for Next.js Client Components
  toPlainObject(): ScenarioPlainObject {
    return {
      id: this.id,
      name: this.name,
      address: this.address,
      description: this.description,
      active: this.active,
      neighborhoodId: this.neighborhoodId,
      neighborhood: this.neighborhood?.toPlainObject(),
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
    };
  }

  // Convert to API format for backend calls
  toApiFormat(): any {
    return {
      id: this.id,
      name: this.name,
      address: this.address,
      description: this.description,
      active: this.active,
      neighborhoodId: this.neighborhoodId,
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
      typeof apiData.address === 'string' &&
      apiData.address.trim().length > 0 &&
      typeof apiData.active === 'boolean'
    );
  }
}
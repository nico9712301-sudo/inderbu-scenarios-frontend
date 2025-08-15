// Domain Entity: Neighborhood
// Represents the core business concept of a neighborhood with rich behavior

import { Neighborhood } from '@/shared/api/domain-types';

export class NeighborhoodEntity {
  public readonly id: number;
  public readonly name: string;
  public readonly communeId?: number;
  public readonly communeName?: string;
  public readonly cityId?: number;
  public readonly cityName?: string;

  private constructor(
    id: number, 
    name: string, 
    communeId?: number,
    communeName?: string,
    cityId?: number,
    cityName?: string
  ) {
    this.id = id;
    this.name = name;
    this.communeId = communeId;
    this.communeName = communeName;
    this.cityId = cityId;
    this.cityName = cityName;
  }

  // Factory method to create from API data
  static fromApiData(apiData: Neighborhood): NeighborhoodEntity {
    if (!NeighborhoodEntity.isValidApiData(apiData)) {
      throw new NeighborhoodDomainError(`Invalid neighborhood data: ${JSON.stringify(apiData)}`);
    }

    return new NeighborhoodEntity(
      apiData.id,
      apiData.name.trim(),
      apiData.commune?.id,
      apiData.commune?.name?.trim(),
      apiData.commune?.city?.id,
      apiData.commune?.city?.name?.trim()
    );
  }

  // Factory method to create multiple entities from API array
  static fromApiDataArray(apiDataArray: Neighborhood[]): NeighborhoodEntity[] {
    if (!Array.isArray(apiDataArray)) {
      throw new NeighborhoodDomainError('Expected array of neighborhoods');
    }

    return apiDataArray.map(apiData => NeighborhoodEntity.fromApiData(apiData));
  }

  // Domain validation
  private static isValidApiData(apiData: any): apiData is Neighborhood {
    return (
      apiData &&
      typeof apiData.id === 'number' &&
      typeof apiData.name === 'string' &&
      apiData.name.trim().length > 0 &&
      apiData.id > 0
    );
  }

  // Domain business logic
  isActive(): boolean {
    return this.name.trim().length > 0;
  }

  hasCommune(): boolean {
    return this.communeId !== undefined && this.communeId > 0;
  }

  hasCity(): boolean {
    return this.cityId !== undefined && this.cityId > 0;
  }

  getFullName(): string {
    if (this.hasCommune() && this.hasCity()) {
      return `${this.name}, ${this.communeName}, ${this.cityName}`;
    } else if (this.hasCommune()) {
      return `${this.name}, ${this.communeName}`;
    }
    return this.name;
  }

  matchesSearchQuery(query: string): boolean {
    if (!query || query.trim().length === 0) {
      return true;
    }
    
    const searchTerm = query.toLowerCase().trim();
    return (
      this.name.toLowerCase().includes(searchTerm) ||
      (this.communeName && this.communeName.toLowerCase().includes(searchTerm)) ||
      (this.cityName && this.cityName.toLowerCase().includes(searchTerm)) ||
      this.getFullName().toLowerCase().includes(searchTerm)
    );
  }

  // Domain comparison
  equals(other: NeighborhoodEntity): boolean {
    return this.id === other.id && this.name === other.name;
  }

  // Convert to plain object for serialization
  toPlainObject(): NeighborhoodPlainObject {
    return {
      id: this.id,
      name: this.name,
      communeId: this.communeId,
      communeName: this.communeName,
      cityId: this.cityId,
      cityName: this.cityName,
      fullName: this.getFullName()
    };
  }

  // Convert to API format if needed
  toApiFormat(): Neighborhood {
    return {
      id: this.id,
      name: this.name,
      commune: this.hasCommune() ? {
        id: this.communeId!,
        name: this.communeName!,
        city: this.hasCity() ? {
          id: this.cityId!,
          name: this.cityName!
        } : undefined
      } : undefined
    };
  }
}

// Plain object representation for serialization
export interface NeighborhoodPlainObject {
  id: number;
  name: string;
  communeId?: number;
  communeName?: string;
  cityId?: number;
  cityName?: string;
  fullName: string;
}

// Domain-specific error
export class NeighborhoodDomainError extends Error {
  constructor(message: string) {
    super(`Neighborhood Domain Error: ${message}`);
    this.name = 'NeighborhoodDomainError';
  }
}

// Domain value objects for filtering
export class NeighborhoodSearchCriteria {
  constructor(
    public readonly searchQuery?: string,
    public readonly communeId?: number,
    public readonly cityId?: number,
    public readonly limit?: number
  ) {}

  static create(
    searchQuery?: string, 
    communeId?: number, 
    cityId?: number, 
    limit?: number
  ): NeighborhoodSearchCriteria {
    return new NeighborhoodSearchCriteria(
      searchQuery?.trim() || undefined,
      communeId && communeId > 0 ? communeId : undefined,
      cityId && cityId > 0 ? cityId : undefined,
      limit && limit > 0 ? limit : undefined
    );
  }

  isValid(): boolean {
    return (
      (!this.searchQuery || this.searchQuery.trim().length > 0) &&
      (!this.communeId || this.communeId > 0) &&
      (!this.cityId || this.cityId > 0) &&
      (!this.limit || (this.limit > 0 && this.limit <= 1000))
    );
  }
}
// Domain Entity: Field Surface Type
// Represents the core business concept of a field surface type with rich behavior

import { FieldSurfaceType } from '@/shared/api/domain-types';

export class FieldSurfaceTypeEntity {
  public readonly id: number;
  public readonly name: string;

  private constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  // Factory method to create from API data
  static fromApiData(apiData: FieldSurfaceType): FieldSurfaceTypeEntity {
    if (!FieldSurfaceTypeEntity.isValidApiData(apiData)) {
      throw new FieldSurfaceTypeDomainError(`Invalid field surface type data: ${JSON.stringify(apiData)}`);
    }

    return new FieldSurfaceTypeEntity(
      apiData.id,
      apiData.name.trim()
    );
  }

  // Factory method to create multiple entities from API array
  static fromApiDataArray(apiDataArray: FieldSurfaceType[]): FieldSurfaceTypeEntity[] {
    if (!Array.isArray(apiDataArray)) {
      throw new FieldSurfaceTypeDomainError('Expected array of field surface types');
    }

    return apiDataArray.map(apiData => FieldSurfaceTypeEntity.fromApiData(apiData));
  }

  // Domain validation
  private static isValidApiData(apiData: any): apiData is FieldSurfaceType {
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

  matchesSearchQuery(query: string): boolean {
    if (!query || query.trim().length === 0) {
      return true;
    }
    
    return this.name.toLowerCase().includes(query.toLowerCase().trim());
  }

  // Domain comparison
  equals(other: FieldSurfaceTypeEntity): boolean {
    return this.id === other.id && this.name === other.name;
  }

  // Convert to plain object for serialization
  toPlainObject(): FieldSurfaceTypePlainObject {
    return {
      id: this.id,
      name: this.name
    };
  }

  // Convert to API format if needed
  toApiFormat(): FieldSurfaceType {
    return {
      id: this.id,
      name: this.name
    };
  }
}

// Plain object representation for serialization
export interface FieldSurfaceTypePlainObject {
  id: number;
  name: string;
}

// Domain-specific error
export class FieldSurfaceTypeDomainError extends Error {
  constructor(message: string) {
    super(`FieldSurfaceType Domain Error: ${message}`);
    this.name = 'FieldSurfaceTypeDomainError';
  }
}

// Domain value objects for filtering
export class FieldSurfaceTypeSearchCriteria {
  constructor(
    public readonly searchQuery?: string,
    public readonly limit?: number
  ) {}

  static create(searchQuery?: string, limit?: number): FieldSurfaceTypeSearchCriteria {
    return new FieldSurfaceTypeSearchCriteria(
      searchQuery?.trim() || undefined,
      limit && limit > 0 ? limit : undefined
    );
  }

  isValid(): boolean {
    return (
      (!this.searchQuery || this.searchQuery.trim().length > 0) &&
      (!this.limit || (this.limit > 0 && this.limit <= 1000))
    );
  }
}
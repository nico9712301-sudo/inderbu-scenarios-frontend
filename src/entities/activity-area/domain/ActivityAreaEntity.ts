import { ActivityArea } from '@/shared/api/domain-types';

export class ActivityAreaEntity {
  public readonly id: number;
  public readonly name: string;

  private constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  // Factory method to create from API data
  static fromApiData(apiData: ActivityArea): ActivityAreaEntity {
    if (!ActivityAreaEntity.isValidApiData(apiData)) {
      throw new ActivityAreaDomainError(`Invalid activity area data: ${JSON.stringify(apiData)}`);
    }

    return new ActivityAreaEntity(
      apiData.id,
      apiData.name.trim()
    );
  }

  // Factory method to create multiple entities from API array
  static fromApiDataArray(apiDataArray: ActivityArea[]): ActivityAreaEntity[] {
    if (!Array.isArray(apiDataArray)) {
      throw new ActivityAreaDomainError('Expected array of activity areas');
    }

    return apiDataArray.map(apiData => ActivityAreaEntity.fromApiData(apiData));
  }


  // Domain validation
  private static isValidApiData(apiData: any): apiData is ActivityArea {
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
  equals(other: ActivityAreaEntity): boolean {
    return this.id === other.id && this.name === other.name;
  }

  // Convert to plain object for serialization
  toPlainObject(): ActivityAreaPlainObject {
    return {
      id: this.id,
      name: this.name
    };
  }

  // Convert to API format if needed
  toApiFormat(): ActivityArea {
    return {
      id: this.id,
      name: this.name
    };
  }
}

// Plain object representation for serialization
export interface ActivityAreaPlainObject {
  id: number;
  name: string;
}

// Domain-specific error
export class ActivityAreaDomainError extends Error {
  constructor(message: string) {
    super(`ActivityArea Domain Error: ${message}`);
    this.name = 'ActivityAreaDomainError';
  }
}

// Domain value objects for filtering
export class ActivityAreaSearchCriteria {
  constructor(
    public readonly searchQuery?: string,
    public readonly limit?: number
  ) {}

  static create(searchQuery?: string, limit?: number): ActivityAreaSearchCriteria {
    return new ActivityAreaSearchCriteria(
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
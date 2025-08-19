// Domain Entity: City
export interface CityPlainObject {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export class CityDomainError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'CityDomainError';
  }
}

export class CityEntity {
  public readonly id: number;
  public readonly name: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(
    id: number,
    name: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.name = name.trim();
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Factory method from API data
  static fromApiData(apiData: any): CityEntity {
    if (!CityEntity.isValidApiData(apiData)) {
      throw new CityDomainError(`Invalid city API data: ${JSON.stringify(apiData)}`);
    }

    return new CityEntity(
      apiData.id,
      apiData.name,
      apiData.createdAt ? new Date(apiData.createdAt) : undefined,
      apiData.updatedAt ? new Date(apiData.updatedAt) : undefined
    );
  }

  // Factory method from array
  static fromApiDataArray(apiDataArray: any[]): CityEntity[] {
    if (!Array.isArray(apiDataArray)) {
      throw new CityDomainError('Expected array of city API data');
    }
    
    return apiDataArray.map(apiData => CityEntity.fromApiData(apiData));
  }

  // Factory method for creation (without ID)
  static create(name: string): Omit<CityEntity, 'id'> {
    return {
      name: name.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Omit<CityEntity, 'id'>;
  }

  // Business logic methods
  matchesSearchQuery(query: string): boolean {
    if (!query || query.trim().length === 0) {
      return true;
    }

    const searchTerm = query.toLowerCase();
    return this.name.toLowerCase().includes(searchTerm);
  }

  // Domain validation
  isValidForCreation(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('El nombre es requerido');
    } else if (this.name.length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    } else if (this.name.length > 100) {
      errors.push('El nombre no puede exceder 100 caracteres');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Serialization for Next.js Client Components
  toPlainObject(): CityPlainObject {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
    };
  }

  // Convert to API format for backend calls
  toApiFormat(): any {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
    };
  }

  // For select options and simple data display
  toSelectOption(): { id: number; name: string } {
    return {
      id: this.id,
      name: this.name,
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
      apiData.name.trim().length > 0
    );
  }
}
// Domain Entity: Commune
export interface CommunePlainObject {
  id: number;
  name: string;
  cityId?: number;
  city?: {
    id: number;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CommuneSearchCriteria {
  searchQuery?: string;
  cityId?: number;
  limit?: number;

  isValid(): boolean;
}

export class CommuneDomainError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'CommuneDomainError';
  }
}

export interface CityData {
  id: number;
  name: string;
}

export class CommuneEntity {
  public readonly id: number;
  public readonly name: string;
  public readonly cityId?: number;
  public readonly city?: CityData;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(
    id: number,
    name: string,
    cityId?: number,
    city?: CityData,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.name = name.trim();
    this.cityId = cityId;
    this.city = city;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Factory method from API data
  static fromApiData(apiData: any): CommuneEntity {
    if (!CommuneEntity.isValidApiData(apiData)) {
      throw new CommuneDomainError(`Invalid commune API data: ${JSON.stringify(apiData)}`);
    }

    return new CommuneEntity(
      apiData.id,
      apiData.name,
      apiData.cityId,
      apiData.city,
      apiData.createdAt ? new Date(apiData.createdAt) : undefined,
      apiData.updatedAt ? new Date(apiData.updatedAt) : undefined
    );
  }

  // Factory method from array
  static fromApiDataArray(apiDataArray: any[]): CommuneEntity[] {
    if (!Array.isArray(apiDataArray)) {
      throw new CommuneDomainError('Expected array of commune API data');
    }
    
    return apiDataArray.map(apiData => CommuneEntity.fromApiData(apiData));
  }

  // Factory method for creation (without ID)
  static create(
    name: string,
    cityId?: number,
    city?: CityData
  ): Omit<CommuneEntity, 'id'> {
    return {
      name: name.trim(),
      cityId,
      city,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Omit<CommuneEntity, 'id'>;
  }

  // Business logic methods
  hasCity(): boolean {
    return Boolean(this.cityId && this.city);
  }

  getCityName(): string {
    return this.city?.name || 'Sin ciudad asignada';
  }

  getFullName(): string {
    const displayName = this.name || "Sin nombre";
    if (this.hasCity()) {
      return `${displayName}, ${this.getCityName()}`;
    }
    return displayName;
  }

  matchesSearchQuery(query: string): boolean {
    if (!query || query.trim().length === 0) {
      return true;
    }

    const searchTerm = query.toLowerCase();
    const nameMatch = this.name.toLowerCase().includes(searchTerm);
    const cityMatch = this.city?.name.toLowerCase().includes(searchTerm) || false;

    return nameMatch || cityMatch;
  }

  isInCity(cityId: number): boolean {
    return this.cityId === cityId;
  }

  // Domain validation
  isValidForCreation(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('El nombre es requerido');
    } else if (this.name.length < 3) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    } else if (this.name.length > 150) {
      errors.push('El nombre no puede exceder 150 caracteres');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Serialization for Next.js Client Components
  toPlainObject(): CommunePlainObject {
    return {
      id: this.id,
      name: this.name,
      cityId: this.cityId,
      city: this.city,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
    };
  }

  // Convert to API format for backend calls
  toApiFormat(): any {
    return {
      id: this.id,
      name: this.name,
      cityId: this.cityId,
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
      typeof apiData.name === 'string'
      // Allow empty names when reading from backend (backend may return incomplete data)
      // Validation for creation/updates is handled by isValidForCreation()
    );
  }
}
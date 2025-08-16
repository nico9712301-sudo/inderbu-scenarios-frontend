export interface ScenarioDetail {
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
    neighborhood: { id: number; name: string };
  };
  activityArea: { id: number; name: string };
  fieldSurfaceType: { id: number; name: string };
}

// DDD: Domain Repository Interface
export interface ScenarioDetailRepository {
  findById(id: ScenarioId): Promise<ScenarioDetail | null>;
  exists(id: ScenarioId): Promise<boolean>;
}

// DDD: Domain Value Objects
export class ScenarioId {
  private constructor(public readonly value: number) {}

  static create(input: string | number): ScenarioId {
    const numericId = typeof input === 'string' ? parseInt(input, 10) : input;
    
    if (isNaN(numericId)) {
      throw new InvalidScenarioIdError(`Invalid scenario ID format: "${input}"`);
    }
    
    if (numericId <= 0) {
      throw new InvalidScenarioIdError(`Scenario ID must be positive: ${numericId}`);
    }
    
    if (numericId > 999999) {
      throw new InvalidScenarioIdError(`Scenario ID too large: ${numericId}`);
    }
    
    return new ScenarioId(numericId);
  }

  toString(): string {
    return this.value.toString();
  }

  equals(other: ScenarioId): boolean {
    return this.value === other.value;
  }
}

// DDD: Domain Policies
export class ScenarioDetailPolicy {
  static isValidScenarioDetail(scenario: any): boolean {
    return scenario && 
           typeof scenario.id === 'number' && 
           typeof scenario.name === 'string' &&
           scenario.name.trim().length > 0 &&
           scenario.scenario &&
           scenario.activityArea &&
           scenario.fieldSurfaceType;
  }

  static requiresReservation(scenario: ScenarioDetail): boolean {
    // Business rule: scenarios with cost or limited capacity require reservation
    return scenario.hasCost || scenario.numberOfPlayers > 0;
  }

  static canAccommodateSpectators(scenario: ScenarioDetail): boolean {
    return scenario.numberOfSpectators > 0;
  }

  static hasValidRecommendations(scenario: ScenarioDetail): boolean {
    return !!scenario.recommendations && 
           scenario.recommendations.trim().length > 0 &&
           scenario.recommendations !== "No hay recomendaciones disponibles.";
  }

  static getScenarioCategory(scenario: ScenarioDetail): 'free' | 'paid' | 'premium' {
    if (!scenario.hasCost) return 'free';
    if (scenario.numberOfSpectators > 100) return 'premium';
    return 'paid';
  }
}

// DDD: Domain Services
export class ScenarioDetailMapper {
  static toDomainWithDefaults(rawData: any): ScenarioDetail {
    return {
      id: rawData.id || 0,
      name: rawData.name || "Escenario sin nombre",
      hasCost: rawData.hasCost || false,
      numberOfPlayers: rawData.numberOfPlayers || 0,
      numberOfSpectators: rawData.numberOfSpectators || 0,
      recommendations: rawData.recommendations || "No hay recomendaciones disponibles.",
      activityArea: rawData.activityArea || { id: 1, name: "Deportes" },
      fieldSurfaceType: rawData.fieldSurfaceType || { id: 1, name: "Normal" },
      scenario: {
        id: rawData.scenario?.id || 0,
        name: rawData.scenario?.name || "Escenario sin nombre",
        address: rawData.scenario?.address || "Sin dirección",
        neighborhood: rawData.scenario?.neighborhood || { id: 1, name: "Centro" },
      },
    };
  }

  static validateMappedData(scenario: ScenarioDetail): void {
    if (!ScenarioDetailPolicy.isValidScenarioDetail(scenario)) {
      throw new InvalidScenarioDataError('Mapped scenario data is invalid');
    }
  }
}

// DDD: Domain Exceptions
export class InvalidScenarioIdError extends Error {
  constructor(message: string) {
    super(`Invalid scenario ID: ${message}`);
    this.name = 'InvalidScenarioIdError';
  }
}

export class ScenarioNotFoundError extends Error {
  constructor(id: ScenarioId) {
    super(`Scenario with ID ${id.value} not found`);
    this.name = 'ScenarioNotFoundError';
  }
}

export class InvalidScenarioDataError extends Error {
  constructor(message: string) {
    super(`Invalid scenario data: ${message}`);
    this.name = 'InvalidScenarioDataError';
  }
}

export class ScenarioAccessDeniedError extends Error {
  constructor(id: ScenarioId, reason: string) {
    super(`Access denied to scenario ${id.value}: ${reason}`);
    this.name = 'ScenarioAccessDeniedError';
  }
}

// DDD: Domain Events
export class ScenarioDetailAccessedEvent {
  constructor(
    public readonly scenarioId: ScenarioId,
    public readonly scenarioName: string,
    public readonly accessedAt: Date = new Date()
  ) {}
}

export class ScenarioDetailNotFoundEvent {
  constructor(
    public readonly attemptedId: string,
    public readonly timestamp: Date = new Date()
  ) {}
}

export class ScenarioDetailLoadedEvent {
  constructor(
    public readonly scenario: ScenarioDetail,
    public readonly loadTime: number,
    public readonly timestamp: Date = new Date()
  ) {}
}

import { DomainEvent } from "@/entities/reservation/domain/reservation.domain";

// DDD: Sub-Scenario Domain Logic & Repository Interface
export interface SubScenario {
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

export interface PaginatedSubScenarios {
  data: SubScenario[];
  meta: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

// DDD: Domain Repository Interface
export interface SubScenarioRepository {
  findFiltered(filters: ISubScenarioFilters): Promise<PaginatedSubScenarios>;
}

// DDD: Domain Value Objects
export class ISubScenarioFilters {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly searchQuery: string,
    public readonly activityAreaId?: number,
    public readonly neighborhoodId?: number,
    public readonly hasCost?: boolean
  ) {}

  static validate(input: any): ISubScenarioFilters {
    const page = this.validatePage(input.page);
    const limit = this.validateLimit(input.limit);
    const searchQuery = this.validateSearchQuery(input.searchQuery);
    const activityAreaId = this.validateId(input.activityAreaId);
    const neighborhoodId = this.validateId(input.neighborhoodId);
    const hasCost = this.validateBoolean(input.hasCost);

    return new ISubScenarioFilters(
      page,
      limit, 
      searchQuery,
      activityAreaId,
      neighborhoodId,
      hasCost
    );
  }

  private static validatePage(page: any): number {
    const parsed = Number(page);
    if (isNaN(parsed) || parsed < 1) {
      return 1; // Default page
    }
    if (parsed > 1000) {
      throw new SearchLimitExceededError('Page number too high');
    }
    return parsed;
  }

  private static validateLimit(limit: any): number {
    const parsed = Number(limit);
    if (isNaN(parsed) || parsed < 1) {
      return 6; // Default limit
    }
    if (parsed > 50) {
      throw new SearchLimitExceededError('Limit too high, maximum 50 items per page');
    }
    return parsed;
  }

  private static validateSearchQuery(query: any): string {
    if (!query || typeof query !== 'string') {
      return '';
    }
    const trimmed = query.trim();
    if (trimmed.length > 100) {
      throw new InvalidFiltersError('Search query too long');
    }
    return trimmed;
  }

  private static validateId(id: any): number | undefined {
    if (!id) return undefined;
    const parsed = Number(id);
    if (isNaN(parsed) || parsed < 1) {
      return undefined;
    }
    return parsed;
  }

  private static validateBoolean(value: any): boolean | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  }

  // Business Logic: Check if filters are applied
  get hasFiltersApplied(): boolean {
    return !!(
      this.searchQuery ||
      this.activityAreaId ||
      this.neighborhoodId ||
      this.hasCost !== undefined
    );
  }

  // Business Logic: Get applied filters list
  get appliedFiltersList(): string[] {
    const applied: string[] = [];
    if (this.searchQuery) applied.push(`Search: "${this.searchQuery}"`);
    if (this.activityAreaId) applied.push(`Activity Area: ${this.activityAreaId}`);
    if (this.neighborhoodId) applied.push(`Neighborhood: ${this.neighborhoodId}`);
    if (this.hasCost !== undefined) applied.push(`Has Cost: ${this.hasCost ? 'Yes' : 'No'}`);
    return applied;
  }
}

// DDD: Domain Exceptions
export class InvalidFiltersError extends Error {
  constructor(message: string) {
    super(`Invalid filters: ${message}`);
    this.name = 'InvalidFiltersError';
  }
}

export class SearchLimitExceededError extends Error {
  constructor(message: string) {
    super(`Search limit exceeded: ${message}`);
    this.name = 'SearchLimitExceededError';
  }
}

// DDD: Domain Events
export class HomeDataAccessedEvent extends DomainEvent {
  constructor(
    public readonly filters: ISubScenarioFilters,
    public readonly resultCount: number,
    public readonly timestamp: Date = new Date()
  ) {
    super();
  }
}

export class HomeFiltersAppliedEvent extends DomainEvent {
  constructor(
    public readonly appliedFilters: string[],
    public readonly timestamp: Date = new Date()
  ) {
    super();
  }
}

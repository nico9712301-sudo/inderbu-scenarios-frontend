import { DomainEvent } from "@/entities/reservation/domain/reservation.domain";
import { INeighborhood } from "@/presentation/features/auth/interfaces/neighborhood.interface";

export interface NeighborhoodRepository {
  findAll(): Promise<INeighborhood[]>;
  findById(id: number): Promise<INeighborhood | null>;
  findByName(name: string): Promise<INeighborhood[]>;
}

//DDD: Domain Value Objects
export class NeighborhoodFilters {
  constructor(
    public readonly searchQuery?: string,
    public readonly limit?: number
  ) {}

  static validate(input: any): NeighborhoodFilters {
    const searchQuery = input.searchQuery?.trim() || undefined;
    const limit = input.limit ? Number(input.limit) : undefined;
    
    if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
      throw new NeighborhoodValidationError('Invalid limit value');
    }

    return new NeighborhoodFilters(searchQuery, limit);
  }
}

// DDD: Domain Policies
export class NeighborhoodPolicy {
  static isValidNeighborhood(neighborhood: any): boolean {
    return neighborhood && 
           typeof neighborhood.id === 'number' && 
           typeof neighborhood.name === 'string' &&
           neighborhood.name.trim().length > 0;
  }

  static canFilterByNeighborhood(neighborhoodId: number): boolean {
    return neighborhoodId > 0;
  }
}

// DDD: Domain Exceptions
export class NeighborhoodValidationError extends Error {
  constructor(message: string) {
    super(`Neighborhood validation error: ${message}`);
    this.name = 'NeighborhoodValidationError';
  }
}

export class NeighborhoodNotFoundError extends Error {
  constructor(id: number) {
    super(`Neighborhood with id ${id} not found`);
    this.name = 'NeighborhoodNotFoundError';
  }
}

// DDD: Domain Events
export class NeighborhoodsLoadedEvent extends DomainEvent {
  constructor(
    public readonly count: number,
    public readonly timestamp: Date = new Date()
  ) {
    super();
  }
}

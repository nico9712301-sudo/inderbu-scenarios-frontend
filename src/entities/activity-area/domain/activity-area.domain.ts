import { DomainEvent } from "@/entities/reservation/domain/reservation.domain";
import { IActivityArea } from "@/presentation/features/home/types/filters.types";

export interface ActivityAreaRepository {
  findAll(): Promise<IActivityArea[]>;
  findById(id: number): Promise<IActivityArea | null>;
  findByName(name: string): Promise<IActivityArea[]>;
}

// DDD: Domain Value Objects
export class ActivityAreaFilters {
  constructor(
    public readonly searchQuery?: string,
    public readonly limit?: number
  ) {}

  static validate(input: any): ActivityAreaFilters {
    const searchQuery = input.searchQuery?.trim() || undefined;
    const limit = input.limit ? Number(input.limit) : undefined;
    
    if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
      throw new ActivityAreaValidationError('Invalid limit value');
    }

    return new ActivityAreaFilters(searchQuery, limit);
  }
}

// DDD: Domain Policies
export class ActivityAreaPolicy {
  static isValidActivityArea(activityArea: any): boolean {
    return activityArea && 
           typeof activityArea.id === 'number' && 
           typeof activityArea.name === 'string' &&
           activityArea.name.trim().length > 0;
  }

  static canFilterByActivityArea(activityAreaId: number): boolean {
    return activityAreaId > 0;
  }
}

// DDD: Domain Exceptions
export class ActivityAreaValidationError extends Error {
  constructor(message: string) {
    super(`Activity area validation error: ${message}`);
    this.name = 'ActivityAreaValidationError';
  }
}

export class ActivityAreaNotFoundError extends Error {
  constructor(id: number) {
    super(`Activity area with id ${id} not found`);
    this.name = 'ActivityAreaNotFoundError';
  }
}

// DDD: Domain Events
export class ActivityAreasLoadedEvent extends DomainEvent {
  constructor(
    public readonly count: number,
    public readonly timestamp: Date = new Date()
  ) {
    super();
  }
}

/**
 * Pagination Types and Interfaces
 * Consolidated pagination utilities for the application
 */

// Re-export existing PageMetaDto as PageMeta for backward compatibility
export { PageMetaDto as PageMeta } from './types';

// Pagination options interface (consolidated from legacy api.ts)
export interface PageOptions {
  page?: number;
  limit?: number;
  search?: string;
  activityAreaId?: number;
  neighborhoodId?: number;
  scenarioId?: number;
  active?: boolean;
}

// Generic paginated response interface
export interface PagedResponse<T> {
  data: T[];
  meta: PageMeta;
}

// Extended pagination interface with additional common filters
export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}

// Export existing pagination from types.ts for compatibility
export type {
  PageMetaDto,
  PaginatedApiResponse,
  PaginationParams,
  SearchParams,
  ReservationQueryParams
} from './types';
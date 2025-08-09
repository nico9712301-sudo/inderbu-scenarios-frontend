import {
  SubScenarioRepository,
  ISubScenarioFilters,
  PaginatedSubScenarios,
  HomeDataAccessedEvent,
  HomeFiltersAppliedEvent,
} from "@/entities/sub-scenario/domain/sub-scenario.domain";
import {
  ActivityAreaRepository,
  ActivityAreasLoadedEvent,
} from "@/entities/activity-area/domain/activity-area.domain";
import {
  NeighborhoodRepository,
  NeighborhoodsLoadedEvent,
} from "@/entities/neighborhood/domain/neighborhood.domain";
import { IActivityArea, INeighborhood } from "../../types/filters.types";
import { EventBus } from "@/shared/infrastructure/InMemoryEventBus";

export interface HomeFiltersInput {
  page?: string | number;
  limit?: string | number;
  search?: string;
  activityAreaId?: string | number;
  neighborhoodId?: string | number;
  hasCost?: string | boolean;
}

export interface SerializedSubScenarioFilters {
  page: number;
  limit: number;
  searchQuery: string;
  activityAreaId?: number;
  neighborhoodId?: number;
  hasCost?: boolean;
  hasFiltersApplied: boolean;
  appliedFiltersList: string[];
}

export interface HomeDataResponse {
  subScenarios: PaginatedSubScenarios;
  activityAreas: IActivityArea[];
  neighborhoods: INeighborhood[];
  appliedFilters: SerializedSubScenarioFilters; // Plain object instead of class
  metadata: HomeDataMetadata;
}

export interface HomeDataMetadata {
  totalResults: number;
  searchPerformed: boolean;
  filtersApplied: string[];
  loadTime: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Application Use Case Interface
export interface GetHomeDataUseCase {
  execute(input: HomeFiltersInput): Promise<HomeDataResponse>;
}

// Application Use Case Implementation
export class GetHomeDataUseCaseImpl implements GetHomeDataUseCase {
  constructor(
    private readonly subScenarioRepository: SubScenarioRepository,
    private readonly activityAreaRepository: ActivityAreaRepository,
    private readonly neighborhoodRepository: NeighborhoodRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: HomeFiltersInput): Promise<HomeDataResponse> {
    const startTime = Date.now();

    try {
      // Domain: Validate and transform input to domain filters
      const domainFilters = ISubScenarioFilters.validate({
        page: input.page,
        limit: input.limit,
        searchQuery: input.search,
        activityAreaId: input.activityAreaId,
        neighborhoodId: input.neighborhoodId,
        hasCost: input.hasCost,
      });

      console.log("Domain filters validated:", domainFilters);

      // Application: Parallel data fetching
      const [subScenarios, activityAreas, neighborhoods] = await Promise.all([
        this.subScenarioRepository.findFiltered(domainFilters),
        this.activityAreaRepository.findAll(),
        this.neighborhoodRepository.findAll(),
      ]);
      

      console.log(
        `Data loaded: ${subScenarios.data.length} scenarios, ${activityAreas.length} areas, ${neighborhoods.length} neighborhoods`
      );

      // Application: Build metadata
      const metadata = this.buildMetadata(
        subScenarios,
        domainFilters,
        startTime
      );

      // Domain Events: Publish events for analytics/logging
      await this.publishDomainEvents(
        domainFilters,
        subScenarios,
        activityAreas,
        neighborhoods.map(n => ({ ...n, id: String(n.id) }))
      );

      const response: HomeDataResponse = {
        subScenarios,
        activityAreas,
        neighborhoods: neighborhoods.map(n => ({ ...n, id: String(n.id) })),
        appliedFilters: this.serializeFilters(domainFilters), // Serialize class to plain object
        metadata,
      };

      console.log("GetHomeDataUseCase: Execution completed successfully");
      return response;
    } catch (error) {
      console.error("GetHomeDataUseCase: Execution failed:", error);
      throw error; // Re-throw domain exceptions
    }
  }

  private serializeFilters(
    filters: ISubScenarioFilters
  ): SerializedSubScenarioFilters {
    // Convert class instance to plain object for client component compatibility
    return {
      page: filters.page,
      limit: filters.limit,
      searchQuery: filters.searchQuery,
      activityAreaId: filters.activityAreaId,
      neighborhoodId: filters.neighborhoodId,
      hasCost: filters.hasCost,
      hasFiltersApplied: filters.hasFiltersApplied,
      appliedFiltersList: filters.appliedFiltersList,
    };
  }

  private buildMetadata(
    subScenarios: PaginatedSubScenarios,
    filters: ISubScenarioFilters,
    startTime: number
  ): HomeDataMetadata {
    const loadTime = Date.now() - startTime;
    const hasNextPage = subScenarios.meta.page < subScenarios.meta.totalPages;
    const hasPreviousPage = subScenarios.meta.page > 1;

    return {
      totalResults: subScenarios.meta.totalItems,
      searchPerformed: !!filters.searchQuery,
      filtersApplied: filters.appliedFiltersList,
      loadTime,
      hasNextPage,
      hasPreviousPage,
    };
  }

  private async publishDomainEvents(
    filters: ISubScenarioFilters,
    subScenarios: PaginatedSubScenarios,
    activityAreas: IActivityArea[],
    neighborhoods: INeighborhood[]
  ): Promise<void> {
    try {
      // Publish domain events for analytics
      await this.eventBus.publish(
        new HomeDataAccessedEvent(filters, subScenarios.data.length)
      );

      await this.eventBus.publish(
        new ActivityAreasLoadedEvent(activityAreas.length)
      );

      await this.eventBus.publish(
        new NeighborhoodsLoadedEvent(neighborhoods.length)
      );

      if (filters.hasFiltersApplied) {
        await this.eventBus.publish(
          new HomeFiltersAppliedEvent(filters.appliedFiltersList)
        );
      }

      console.log("Domain events published successfully");
    } catch (error) {
      console.warn("⚠️ Failed to publish domain events:", error);
      // Don't fail the main operation if events fail
    }
  }
}

// Factory function for DI
export function createGetHomeDataUseCase(
  subScenarioRepository: SubScenarioRepository,
  activityAreaRepository: ActivityAreaRepository,
  neighborhoodRepository: NeighborhoodRepository,
  eventBus: EventBus
): GetHomeDataUseCase {
  return new GetHomeDataUseCaseImpl(
    subScenarioRepository,
    activityAreaRepository,
    neighborhoodRepository,
    eventBus
  );
}

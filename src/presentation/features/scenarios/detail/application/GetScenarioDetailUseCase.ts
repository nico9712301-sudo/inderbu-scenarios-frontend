// DDD: Main Scenario Detail Use Case (Application Layer)

import { 
  ScenarioDetailRepository, 
  ScenarioDetail, 
  ScenarioId,
  ScenarioDetailPolicy,
  ScenarioDetailAccessedEvent,
  ScenarioDetailNotFoundEvent,
  ScenarioDetailLoadedEvent,
  ScenarioNotFoundError
} from '@/entities/scenario/domain/scenario-detail.domain';
import { EventBus } from '@/shared/infrastructure/InMemoryEventBus';

// Application DTOs
export interface GetScenarioDetailInput {
  id: string;
}

export interface GetScenarioDetailResponse {
  scenario: ScenarioDetail;
  metadata: ScenarioDetailMetadata;
}

export interface ScenarioDetailMetadata {
  scenarioId: number;
  loadTime: number;
  category: 'free' | 'paid' | 'premium';
  requiresReservation: boolean;
  canAccommodateSpectators: boolean;
  hasValidRecommendations: boolean;
  accessedAt: Date;
}

// Application Use Case Interface
export interface GetScenarioDetailUseCase {
  execute(input: GetScenarioDetailInput): Promise<GetScenarioDetailResponse>;
}

// Application Use Case Implementation
export class GetScenarioDetailUseCaseImpl implements GetScenarioDetailUseCase {
  constructor(
    private readonly scenarioDetailRepository: ScenarioDetailRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: GetScenarioDetailInput): Promise<GetScenarioDetailResponse> {
    const startTime = Date.now();
    
    console.log('GetScenarioDetailUseCase: Starting execution with input:', input);

    try {
      // Domain: Validate and create ScenarioId value object
      const scenarioId = ScenarioId.create(input.id);
      
      console.log('Domain ScenarioId validated:', scenarioId.value);

      // Application: Find scenario in repository
      const scenario = await this.scenarioDetailRepository.findById(scenarioId);
      
      if (!scenario) {
        console.warn(`Scenario not found: ${scenarioId.value}`);
        
        // Domain Event: Scenario not found
        await this.publishNotFoundEvent(input.id);
        
        throw new ScenarioNotFoundError(scenarioId);
      }

      console.log(`Scenario found: ${scenario.name} (ID: ${scenario.id})`);

      // Application: Build metadata using domain policies
      const metadata = this.buildMetadata(scenario, scenarioId, startTime);

      // Domain Events: Publish success events
      await this.publishSuccessEvents(scenarioId, scenario, metadata.loadTime);

      const response: GetScenarioDetailResponse = {
        scenario,
        metadata
      };

      console.log('GetScenarioDetailUseCase: Execution completed successfully');
      return response;

    } catch (error) {
      console.error('GetScenarioDetailUseCase: Execution failed:', error);
      
      // Domain Event: Error occurred (but don't throw from event publishing)
      try {
        await this.publishNotFoundEvent(input.id);
      } catch (eventError) {
        console.warn('⚠️ Failed to publish error event:', eventError);
      }
      
      throw error; // Re-throw domain exceptions
    }
  }

  private buildMetadata(
    scenario: ScenarioDetail, 
    scenarioId: ScenarioId, 
    startTime: number
  ): ScenarioDetailMetadata {
    const loadTime = Date.now() - startTime;
    
    // Apply domain policies to build metadata
    return {
      scenarioId: scenarioId.value,
      loadTime,
      category: ScenarioDetailPolicy.getScenarioCategory(scenario),
      requiresReservation: ScenarioDetailPolicy.requiresReservation(scenario),
      canAccommodateSpectators: ScenarioDetailPolicy.canAccommodateSpectators(scenario),
      hasValidRecommendations: ScenarioDetailPolicy.hasValidRecommendations(scenario),
      accessedAt: new Date()
    };
  }

  private async publishSuccessEvents(
    scenarioId: ScenarioId, 
    scenario: ScenarioDetail, 
    loadTime: number
  ): Promise<void> {
    try {
      // Publish domain events for analytics/logging
      await this.eventBus.publish(new ScenarioDetailAccessedEvent(
        scenarioId,
        scenario.name
      ));

      await this.eventBus.publish(new ScenarioDetailLoadedEvent(
        scenario,
        loadTime
      ));

      console.log('Domain events published successfully');
    } catch (error) {
      console.warn('⚠️ Failed to publish success events:', error);
      // Don't fail the main operation if events fail
    }
  }

  private async publishNotFoundEvent(attemptedId: string): Promise<void> {
    try {
      await this.eventBus.publish(new ScenarioDetailNotFoundEvent(attemptedId));
      console.log('Not found event published');
    } catch (error) {
      console.warn('⚠️ Failed to publish not found event:', error);
      // Don't fail the main operation if events fail
    }
  }
}

// Factory function for DI
export function createGetScenarioDetailUseCase(
  scenarioDetailRepository: ScenarioDetailRepository,
  eventBus: EventBus
): GetScenarioDetailUseCase {
  return new GetScenarioDetailUseCaseImpl(
    scenarioDetailRepository,
    eventBus
  );
}

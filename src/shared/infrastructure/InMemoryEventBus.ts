import { DomainEvent, EventBus } from '@/entities/reservation/domain/reservation.domain';

/**
 * In-Memory Event Bus Implementation
 * 
 * Simple event bus for domain events in development/testing.
 * In production, this should be replaced with a proper message queue.
 */
export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, ((event: DomainEvent) => Promise<void>)[]> = new Map();

  async publish(event: DomainEvent): Promise<void> {
    const eventName = event.constructor.name;
    const eventHandlers = this.handlers.get(eventName) || [];
    
    console.log(`Publishing event: ${eventName}`, {
      eventId: event.eventId,
      occurredOn: event.occurredOn,
      data: event
    });

    // Execute all handlers for this event type
    const promises = eventHandlers.map(handler => 
      this.executeHandler(handler, event, eventName)
    );

    await Promise.allSettled(promises);
  }

  subscribe<T extends DomainEvent>(
    eventType: new (...args: any[]) => T,
    handler: (event: T) => Promise<void>
  ): void {
    const eventName = eventType.name;
    
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }

    this.handlers.get(eventName)!.push(handler as (event: DomainEvent) => Promise<void>);
    
    console.log(`Subscribed to event: ${eventName}`);
  }

  private async executeHandler(
    handler: (event: DomainEvent) => Promise<void>,
    event: DomainEvent,
    eventName: string
  ): Promise<void> {
    try {
      await handler(event);
      console.log(`Event handler executed successfully for: ${eventName}`);
    } catch (error) {
      console.error(`Event handler failed for: ${eventName}`, error);
      // Don't throw - event publishing should not fail if handlers fail
    }
  }

  // For testing and debugging
  getSubscriberCount(eventType: new (...args: any[]) => DomainEvent): number {
    const eventName = eventType.name;
    return this.handlers.get(eventName)?.length || 0;
  }

  clear(): void {
    this.handlers.clear();
    console.log('Event bus cleared');
  }
}

/**
 * Factory function for dependency injection
 */
export function createInMemoryEventBus(): EventBus {
  return new InMemoryEventBus();
}

/**
 * Re-export EventBus interface and DomainEvent for convenience
 */
export type { EventBus } from '@/entities/reservation/domain/reservation.domain';
export { DomainEvent } from '@/entities/reservation/domain/reservation.domain';
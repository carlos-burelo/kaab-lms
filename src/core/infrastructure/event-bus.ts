/**
 * Event Bus Implementation
 * Manages domain events and their handlers
 */

import type {
  DomainEvent,
  EventHandler,
  EventBus as IEventBus,
} from '../shared/domain-event';

export class EventBus implements IEventBus {
  private static instance: EventBus;
  private handlers: Map<string, Set<EventHandler<DomainEvent>>>;
  private eventQueue: DomainEvent[];
  private isProcessing: boolean;

  private constructor() {
    this.handlers = new Map();
    this.eventQueue = [];
    this.isProcessing = false;
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }

    this.handlers.get(eventName)!.add(handler as EventHandler<DomainEvent>);
  }

  unsubscribe<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): void {
    const eventHandlers = this.handlers.get(eventName);
    if (eventHandlers) {
      eventHandlers.delete(handler as EventHandler<DomainEvent>);
    }
  }

  async publish(event: DomainEvent): Promise<void> {
    this.eventQueue.push(event);

    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    this.eventQueue.push(...events);

    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      await this.handleEvent(event);
    }

    this.isProcessing = false;
  }

  private async handleEvent(event: DomainEvent): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventName);

    if (!eventHandlers || eventHandlers.size === 0) {
      return;
    }

    const handlersArray = Array.from(eventHandlers);

    // Execute handlers sequentially
    for (const handler of handlersArray) {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error(
          `Error handling event ${event.eventName}:`,
          error
        );
        // Continue processing other handlers
      }
    }
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clearHandlers(): void {
    this.handlers.clear();
  }

  /**
   * Get all registered event names
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get handler count for an event
   */
  getHandlerCount(eventName: string): number {
    return this.handlers.get(eventName)?.size || 0;
  }
}

/**
 * Singleton instance
 */
export const eventBus = EventBus.getInstance();

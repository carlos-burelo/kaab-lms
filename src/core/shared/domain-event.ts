/**
 * Domain Event Base Class
 * Events represent something that happened in the domain
 */

import { nanoid } from 'nanoid';

export interface DomainEventProps {
  aggregateId: string;
  occurredAt?: Date;
  [key: string]: unknown;
}

export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;
  public readonly aggregateId: string;
  public readonly eventName: string;

  constructor(props: DomainEventProps) {
    this.eventId = nanoid();
    this.occurredAt = props.occurredAt || new Date();
    this.aggregateId = props.aggregateId;
    this.eventName = this.constructor.name;
  }

  abstract toObject(): Record<string, unknown>;
}

/**
 * Event Handler Interface
 */
export interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void> | void;
}

/**
 * Event Bus Interface
 */
export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): void;
  unsubscribe<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): void;
}

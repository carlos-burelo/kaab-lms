/**
 * Aggregate Root Base Class
 * Aggregates are the primary building blocks of DDD
 * They ensure consistency and encapsulate business rules
 */

import type { DomainEvent } from './domain-event'
import { Entity, type EntityProps } from './entity'

export abstract class AggregateRoot<T extends EntityProps> extends Entity<T> {
  private _domainEvents: DomainEvent[] = []

  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event)
  }

  public clearEvents(): void {
    this._domainEvents = []
  }

  protected removeDomainEvent(event: DomainEvent): void {
    const index = this._domainEvents.indexOf(event)
    if (index !== -1) {
      this._domainEvents.splice(index, 1)
    }
  }
}

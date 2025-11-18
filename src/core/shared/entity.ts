/**
 * Base Entity Class
 * Provides common functionality for all domain entities
 */

import { nanoid } from 'nanoid';

export interface EntityProps {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export abstract class Entity<T extends EntityProps> {
  protected readonly _id: string;
  protected _props: T;
  protected _createdAt: Date;
  protected _updatedAt: Date;

  constructor(props: T, id?: string) {
    this._id = id || props.id || nanoid();
    this._props = props;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }

  /**
   * Compares two entities for equality
   */
  equals(entity?: Entity<T>): boolean {
    if (!entity) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this._id === entity._id;
  }

  /**
   * Converts entity to plain object
   */
  abstract toObject(): T & { id: string; createdAt: Date; updatedAt: Date };

  /**
   * Creates a copy of the entity
   */
  abstract clone(): Entity<T>;
}

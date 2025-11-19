/**
 * Base Repository Interface
 * Defines common operations for all repositories
 */

import type { AggregateRoot, EntityProps } from './'
import type { Result } from './result'

export interface Repository<T extends AggregateRoot<EntityProps>> {
  findById(id: string): Promise<Result<T | null>>
  save(entity: T): Promise<Result<T>>
  delete(id: string): Promise<Result<void>>
  exists(id: string): Promise<Result<boolean>>
}

/**
 * Specification Pattern for complex queries
 */
export interface Specification<T> {
  isSatisfiedBy(entity: T): boolean
  toQuery(): unknown // Prisma where clause
}

export abstract class BaseSpecification<T> implements Specification<T> {
  abstract isSatisfiedBy(entity: T): boolean
  abstract toQuery(): unknown

  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other)
  }

  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other)
  }

  not(): Specification<T> {
    return new NotSpecification(this)
  }
}

class AndSpecification<T> extends BaseSpecification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>
  ) {
    super()
  }

  isSatisfiedBy(entity: T): boolean {
    return this.left.isSatisfiedBy(entity) && this.right.isSatisfiedBy(entity)
  }

  toQuery(): unknown {
    return {
      AND: [this.left.toQuery(), this.right.toQuery()]
    }
  }
}

class OrSpecification<T> extends BaseSpecification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>
  ) {
    super()
  }

  isSatisfiedBy(entity: T): boolean {
    return this.left.isSatisfiedBy(entity) || this.right.isSatisfiedBy(entity)
  }

  toQuery(): unknown {
    return {
      OR: [this.left.toQuery(), this.right.toQuery()]
    }
  }
}

class NotSpecification<T> extends BaseSpecification<T> {
  constructor(private spec: Specification<T>) {
    super()
  }

  isSatisfiedBy(entity: T): boolean {
    return !this.spec.isSatisfiedBy(entity)
  }

  toQuery(): unknown {
    return {
      NOT: this.spec.toQuery()
    }
  }
}

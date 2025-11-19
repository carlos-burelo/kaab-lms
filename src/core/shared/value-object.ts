/**
 * Base Value Object Class
 * Value objects are immutable and compared by value
 */

export interface ValueObjectProps {
  [key: string]: unknown
}

export abstract class ValueObject<T extends ValueObjectProps> {
  protected readonly props: T

  constructor(props: T) {
    this.props = Object.freeze(props)
  }

  /**
   * Compares two value objects for equality
   */
  equals(vo?: ValueObject<T>): boolean {
    if (!vo) {
      return false
    }

    if (this === vo) {
      return true
    }

    return this.deepEquals(this.props, vo.props)
  }

  private deepEquals(obj1: unknown, obj2: unknown): boolean {
    if (obj1 === obj2) {
      return true
    }

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
      return false
    }

    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) {
      return false
    }

    for (const key of keys1) {
      if (!keys2.includes(key)) {
        return false
      }

      if (!this.deepEquals((obj1 as Record<string, unknown>)[key], (obj2 as Record<string, unknown>)[key])) {
        return false
      }
    }

    return true
  }

  /**
   * Returns the value of the value object
   */
  getValue(): T {
    return this.props
  }

  /**
   * Converts value object to plain object
   */
  toObject(): T {
    return { ...this.props }
  }
}

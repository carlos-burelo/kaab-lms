/**
 * Result Pattern Implementation
 * Provides type-safe error handling without exceptions
 * Based on Railway Oriented Programming
 */

import { error } from 'console'

export class Result<T, E = Error> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  /**
   * Creates a successful result
   */
  static ok<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined)
  }

  /**
   * Creates a failed result
   */
  static fail<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error)
  }

  /**
   * Creates a result from a function that might throw
   */
  static from<T, E = Error>(fn: () => T): Result<T, E> {
    try {
      return Result.ok(fn())
    } catch (_error) {
      return Result.fail(_error as E)
    }
  }

  /**
   * Creates a result from a Promise
   */
  static async fromPromise<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
    try {
      const value = await promise
      return Result.ok(value)
    } catch (_error) {
      return Result.fail(error as E)
    }
  }

  /**
   * Combines multiple results into one
   * If any result fails, returns the first failure
   */
  static combine<T, E = Error>(results: Result<T, E>[]): Result<T[], E> {
    const values: T[] = []
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail(result.error)
      }
      values.push(result.value)
    }
    return Result.ok(values)
  }

  get isSuccess(): boolean {
    return this._isSuccess
  }

  get isFailure(): boolean {
    return !this._isSuccess
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from a failed result')
    }
    return this._value!
  }

  get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from a successful result')
    }
    return this._error!
  }

  /**
   * Maps the value if successful
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isFailure) {
      return Result.fail(this.error)
    }
    return Result.ok(fn(this.value))
  }

  /**
   * Maps the error if failed
   */
  mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this.isSuccess) {
      return Result.ok(this.value)
    }
    return Result.fail(fn(this.error))
  }

  /**
   * Flat map for chaining results
   */
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isFailure) {
      return Result.fail(this.error)
    }
    return fn(this.value)
  }

  /**
   * Maps the value asynchronously
   */
  async mapAsync<U>(fn: (value: T) => Promise<U>): Promise<Result<U, E>> {
    if (this.isFailure) {
      return Result.fail(this.error)
    }
    try {
      const newValue = await fn(this.value)
      return Result.ok(newValue)
    } catch (_error) {
      return Result.fail(error as E)
    }
  }

  /**
   * Executes a side effect if successful
   */
  tap(fn: (value: T) => void): Result<T, E> {
    if (this.isSuccess) {
      fn(this.value)
    }
    return this
  }

  /**
   * Executes a side effect if failed
   */
  tapError(fn: (error: E) => void): Result<T, E> {
    if (this.isFailure) {
      fn(this.error)
    }
    return this
  }

  /**
   * Provides a default value if failed
   */
  getOrElse(defaultValue: T): T {
    return this.isSuccess ? this.value : defaultValue
  }

  /**
   * Matches on success or failure
   */
  match<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    return this.isSuccess ? onSuccess(this.value) : onFailure(this.error)
  }

  /**
   * Converts to a Promise
   */
  toPromise(): Promise<T> {
    return this.isSuccess ? Promise.resolve(this.value) : Promise.reject(this.error)
  }

  /**
   * Converts to a nullable value
   */
  toNullable(): T | null {
    return this.isSuccess ? this.value : null
  }
}

/**
 * Type alias for async results
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>

/**
 * Helper function to create a successful result
 */
export const ok = <T, E = Error>(value: T): Result<T, E> => Result.ok<T, E>(value)

/**
 * Helper function to create a failed result
 */
export const err = <T, E = Error>(error: E): Result<T, E> => Result.fail<T, E>(error)

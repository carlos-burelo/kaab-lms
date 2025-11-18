/**
 * Use Case Interface
 * Represents an application-specific business rule
 */

import { Result } from './result';

export interface UseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<Result<TResponse>>;
}

/**
 * Base Use Case Class
 * Provides common functionality for all use cases
 */
export abstract class BaseUseCase<TRequest, TResponse>
  implements UseCase<TRequest, TResponse>
{
  abstract execute(request: TRequest): Promise<Result<TResponse>>;

  /**
   * Validates the request
   * Override this method to add custom validation
   */
  protected async validate(request: TRequest): Promise<Result<void>> {
    // Override in subclasses
    return Result.ok(undefined);
  }
}

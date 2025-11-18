/**
 * Infrastructure Layer Exports
 */

export * from './event-bus';
export * from './dependency-injection';
export * from './container.config';

import { container } from './dependency-injection';

/**
 * Helper function to get use case from container
 */
export function getUseCase<T>(token: string | symbol): T {
  return container.resolve<T>(token);
}

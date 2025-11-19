/**
 * Infrastructure Layer Exports
 */

export * from './container.config'
export * from './dependency-injection'
export * from './event-bus'

import { container } from './dependency-injection'

/**
 * Helper function to get use case from container
 */
export function getUseCase<T>(token: string | symbol): T {
  return container.resolve<T>(token)
}

/**
 * Application Bootstrap
 * Initializes the application infrastructure
 * Call this once when the app starts
 */

import { configureContainer } from './infrastructure/container.config';
import { eventBus } from './infrastructure/event-bus';

// Import event handlers here when created
// import { CourseCreatedHandler } from '@/modules/course/infrastructure/event-handlers';

let isInitialized = false;

export function bootstrapApplication(): void {
  if (isInitialized) {
    console.warn('Application already bootstrapped');
    return;
  }

  console.log('🚀 Bootstrapping application...');

  // 1. Configure dependency injection container
  configureContainer();
  console.log('✅ DI Container configured');

  // 2. Register event handlers
  registerEventHandlers();
  console.log('✅ Event handlers registered');

  isInitialized = true;
  console.log('🎉 Application bootstrap complete!');
}

function registerEventHandlers(): void {
  // Register domain event handlers here
  // Example:
  // eventBus.subscribe('CourseCreatedEvent', new CourseCreatedHandler());
  // eventBus.subscribe('CoursePublishedEvent', new NotifyStudentsHandler());

  // TODO: Add event handlers as you create them
}

/**
 * Get initialization status
 */
export function isAppInitialized(): boolean {
  return isInitialized;
}

/**
 * Reset initialization (useful for testing)
 */
export function resetApp(): void {
  isInitialized = false;
  eventBus.clearHandlers();
}

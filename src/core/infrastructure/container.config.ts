/**
 * Dependency Injection Container Configuration
 * Registers all dependencies for the application
 */

import { container, TOKENS } from './dependency-injection';
import { eventBus } from './event-bus';
import { prisma } from '@/lib/prisma';

// Course Module
import { CourseRepository } from '@/modules/course/infrastructure/course.repository';
import {
  CreateCourseUseCase,
  UpdateCourseUseCase,
  PublishCourseUseCase,
  GetCourseUseCase,
} from '@/modules/course/application/use-cases';

/**
 * Initialize and configure the DI container
 */
export function configureContainer(): void {
  // Infrastructure
  container.registerInstance(TOKENS.EVENT_BUS, eventBus);
  container.registerInstance(TOKENS.PRISMA_CLIENT, prisma);

  // Course Module Repositories
  container.register(
    TOKENS.COURSE_REPOSITORY,
    () => new CourseRepository()
  );

  // Course Module Use Cases
  container.register(
    TOKENS.CREATE_COURSE_USE_CASE,
    () =>
      new CreateCourseUseCase(
        container.resolve(TOKENS.COURSE_REPOSITORY)
      )
  );

  container.register(
    TOKENS.UPDATE_COURSE_USE_CASE,
    () =>
      new UpdateCourseUseCase(
        container.resolve(TOKENS.COURSE_REPOSITORY)
      )
  );

  container.register(
    TOKENS.PUBLISH_COURSE_USE_CASE,
    () =>
      new PublishCourseUseCase(
        container.resolve(TOKENS.COURSE_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_COURSE_USE_CASE,
    () =>
      new GetCourseUseCase(
        container.resolve(TOKENS.COURSE_REPOSITORY)
      )
  );
}

/**
 * Get a use case instance from the container
 */
export function getUseCase<T>(token: symbol): T {
  return container.resolve<T>(token);
}

/**
 * Dependency Injection Container
 * Simple IoC container for managing dependencies
 */

type Constructor<T> = new (...args: unknown[]) => T;
type Factory<T> = () => T;
type Dependency<T> = Constructor<T> | Factory<T>;

interface Registration<T> {
  dependency: Dependency<T>;
  singleton: boolean;
  instance?: T;
}

export class Container {
  private static instance: Container;
  private registry: Map<string | symbol, Registration<unknown>>;

  private constructor() {
    this.registry = new Map();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Register a dependency
   */
  register<T>(
    token: string | symbol,
    dependency: Dependency<T>,
    options: { singleton?: boolean } = {}
  ): void {
    const { singleton = true } = options;

    this.registry.set(token, {
      dependency,
      singleton,
    });
  }

  /**
   * Register a singleton instance directly
   */
  registerInstance<T>(token: string | symbol, instance: T): void {
    this.registry.set(token, {
      dependency: () => instance,
      singleton: true,
      instance,
    });
  }

  /**
   * Resolve a dependency
   */
  resolve<T>(token: string | symbol): T {
    const registration = this.registry.get(token) as
      | Registration<T>
      | undefined;

    if (!registration) {
      throw new Error(`Dependency not found for token: ${String(token)}`);
    }

    // Return cached instance if singleton
    if (registration.singleton && registration.instance) {
      return registration.instance;
    }

    // Create new instance
    const instance = this.createInstance(registration.dependency);

    // Cache if singleton
    if (registration.singleton) {
      registration.instance = instance;
    }

    return instance;
  }

  /**
   * Check if a dependency is registered
   */
  has(token: string | symbol): boolean {
    return this.registry.has(token);
  }

  /**
   * Clear a specific registration
   */
  clear(token: string | symbol): void {
    this.registry.delete(token);
  }

  /**
   * Clear all registrations
   */
  clearAll(): void {
    this.registry.clear();
  }

  private createInstance<T>(dependency: Dependency<T>): T {
    if (this.isConstructor(dependency)) {
      return new dependency();
    } else {
      return dependency();
    }
  }

  private isConstructor<T>(
    dependency: Dependency<T>
  ): dependency is Constructor<T> {
    return dependency.prototype !== undefined;
  }

  /**
   * Get all registered tokens
   */
  getRegisteredTokens(): (string | symbol)[] {
    return Array.from(this.registry.keys());
  }
}

/**
 * Singleton instance
 */
export const container = Container.getInstance();

/**
 * Tokens for common dependencies
 */
export const TOKENS = {
  // Infrastructure
  EVENT_BUS: Symbol.for('EventBus'),
  PRISMA_CLIENT: Symbol.for('PrismaClient'),
  STORAGE_SERVICE: Symbol.for('StorageService'),

  // Repositories - User
  USER_REPOSITORY: Symbol.for('UserRepository'),
  USER_PROFILE_REPOSITORY: Symbol.for('UserProfileRepository'),

  // Repositories - Course
  COURSE_REPOSITORY: Symbol.for('CourseRepository'),
  MODULE_REPOSITORY: Symbol.for('ModuleRepository'),
  LESSON_REPOSITORY: Symbol.for('LessonRepository'),
  ENROLLMENT_REPOSITORY: Symbol.for('EnrollmentRepository'),

  // Repositories - Assessment
  QUIZ_REPOSITORY: Symbol.for('QuizRepository'),
  ASSIGNMENT_REPOSITORY: Symbol.for('AssignmentRepository'),

  // Repositories - Gamification
  BADGE_REPOSITORY: Symbol.for('BadgeRepository'),
  ACHIEVEMENT_REPOSITORY: Symbol.for('AchievementRepository'),
  MISSION_REPOSITORY: Symbol.for('MissionRepository'),

  // Repositories - Learning Path
  LEARNING_PATH_REPOSITORY: Symbol.for('LearningPathRepository'),

  // Use Cases - Course
  CREATE_COURSE_USE_CASE: Symbol.for('CreateCourseUseCase'),
  UPDATE_COURSE_USE_CASE: Symbol.for('UpdateCourseUseCase'),
  DELETE_COURSE_USE_CASE: Symbol.for('DeleteCourseUseCase'),
  GET_COURSE_USE_CASE: Symbol.for('GetCourseUseCase'),
  LIST_COURSES_USE_CASE: Symbol.for('ListCoursesUseCase'),
  PUBLISH_COURSE_USE_CASE: Symbol.for('PublishCourseUseCase'),

  // Use Cases - Enrollment
  ENROLL_STUDENT_USE_CASE: Symbol.for('EnrollStudentUseCase'),
  UPDATE_PROGRESS_USE_CASE: Symbol.for('UpdateProgressUseCase'),

  // Use Cases - Gamification
  AWARD_BADGE_USE_CASE: Symbol.for('AwardBadgeUseCase'),
  ADD_XP_USE_CASE: Symbol.for('AddXpUseCase'),
} as const;

/**
 * Decorator for dependency injection
 */
export function injectable(token: string | symbol) {
  return function <T extends { new (...args: unknown[]): unknown }>(
    constructor: T
  ) {
    container.register(token, constructor);
    return constructor;
  };
}

/**
 * Decorator for injecting dependencies
 */
export function inject(token: string | symbol) {
  return function (
    target: unknown,
    propertyKey: string,
    parameterIndex: number
  ) {
    // Store metadata for later injection
    const existingInjections =
      Reflect.getMetadata('injections', target) || {};
    existingInjections[parameterIndex] = token;
    Reflect.defineMetadata('injections', existingInjections, target);
  };
}

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
  USER_GAMIFICATION_REPOSITORY: Symbol.for('UserGamificationRepository'),

  // Repositories - Learning Path
  LEARNING_PATH_REPOSITORY: Symbol.for('LearningPathRepository'),

  // Repositories - Message/Communication
  MESSAGE_REPOSITORY: Symbol.for('MessageRepository'),
  CONVERSATION_REPOSITORY: Symbol.for('ConversationRepository'),

  // Repositories - Notification
  NOTIFICATION_REPOSITORY: Symbol.for('NotificationRepository'),

  // Repositories - Productivity
  PERSONAL_TASK_REPOSITORY: Symbol.for('PersonalTaskRepository'),
  CALENDAR_EVENT_REPOSITORY: Symbol.for('CalendarEventRepository'),

  // Repositories - File
  FILE_REPOSITORY: Symbol.for('FileRepository'),

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
  GET_ENROLLMENT_USE_CASE: Symbol.for('GetEnrollmentUseCase'),
  COMPLETE_ENROLLMENT_USE_CASE: Symbol.for('CompleteEnrollmentUseCase'),

  // Use Cases - Quiz
  CREATE_QUIZ_USE_CASE: Symbol.for('CreateQuizUseCase'),
  UPDATE_QUIZ_USE_CASE: Symbol.for('UpdateQuizUseCase'),
  DELETE_QUIZ_USE_CASE: Symbol.for('DeleteQuizUseCase'),
  GET_QUIZ_USE_CASE: Symbol.for('GetQuizUseCase'),

  // Use Cases - Assignment
  CREATE_ASSIGNMENT_USE_CASE: Symbol.for('CreateAssignmentUseCase'),
  UPDATE_ASSIGNMENT_USE_CASE: Symbol.for('UpdateAssignmentUseCase'),
  DELETE_ASSIGNMENT_USE_CASE: Symbol.for('DeleteAssignmentUseCase'),
  GET_ASSIGNMENT_USE_CASE: Symbol.for('GetAssignmentUseCase'),
  SUBMIT_ASSIGNMENT_USE_CASE: Symbol.for('SubmitAssignmentUseCase'),
  GRADE_ASSIGNMENT_USE_CASE: Symbol.for('GradeAssignmentUseCase'),

  // Use Cases - Notification
  CREATE_NOTIFICATION_USE_CASE: Symbol.for('CreateNotificationUseCase'),
  MARK_NOTIFICATION_AS_READ_USE_CASE: Symbol.for('MarkNotificationAsReadUseCase'),
  GET_NOTIFICATIONS_USE_CASE: Symbol.for('GetNotificationsUseCase'),
  GET_UNREAD_COUNT_USE_CASE: Symbol.for('GetUnreadCountUseCase'),

  // Use Cases - Message
  SEND_MESSAGE_USE_CASE: Symbol.for('SendMessageUseCase'),
  GET_CONVERSATION_USE_CASE: Symbol.for('GetConversationUseCase'),
  GET_OR_CREATE_CONVERSATION_USE_CASE: Symbol.for('GetOrCreateConversationUseCase'),
  MARK_MESSAGES_AS_READ_USE_CASE: Symbol.for('MarkMessagesAsReadUseCase'),
  GET_CONVERSATIONS_USE_CASE: Symbol.for('GetConversationsUseCase'),

  // Use Cases - Learning Path
  CREATE_LEARNING_PATH_USE_CASE: Symbol.for('CreateLearningPathUseCase'),
  UPDATE_LEARNING_PATH_USE_CASE: Symbol.for('UpdateLearningPathUseCase'),
  ADD_NODE_USE_CASE: Symbol.for('AddNodeUseCase'),
  ADD_EDGE_USE_CASE: Symbol.for('AddEdgeUseCase'),
  START_LEARNING_PATH_USE_CASE: Symbol.for('StartLearningPathUseCase'),
  COMPLETE_NODE_USE_CASE: Symbol.for('CompleteNodeUseCase'),
  GET_NEXT_NODE_USE_CASE: Symbol.for('GetNextNodeUseCase'),
  GET_USER_PROGRESS_USE_CASE: Symbol.for('GetUserProgressUseCase'),

  // Use Cases - Gamification
  // Badges
  CREATE_BADGE_USE_CASE: Symbol.for('CreateBadgeUseCase'),
  UPDATE_BADGE_USE_CASE: Symbol.for('UpdateBadgeUseCase'),
  DELETE_BADGE_USE_CASE: Symbol.for('DeleteBadgeUseCase'),
  GET_BADGE_USE_CASE: Symbol.for('GetBadgeUseCase'),
  AWARD_BADGE_USE_CASE: Symbol.for('AwardBadgeUseCase'),
  GET_USER_BADGES_USE_CASE: Symbol.for('GetUserBadgesUseCase'),
  // Achievements
  CREATE_ACHIEVEMENT_USE_CASE: Symbol.for('CreateAchievementUseCase'),
  UPDATE_ACHIEVEMENT_USE_CASE: Symbol.for('UpdateAchievementUseCase'),
  DELETE_ACHIEVEMENT_USE_CASE: Symbol.for('DeleteAchievementUseCase'),
  GET_ACHIEVEMENT_USE_CASE: Symbol.for('GetAchievementUseCase'),
  UNLOCK_ACHIEVEMENT_USE_CASE: Symbol.for('UnlockAchievementUseCase'),
  GET_USER_ACHIEVEMENTS_USE_CASE: Symbol.for('GetUserAchievementsUseCase'),
  // Missions
  CREATE_MISSION_USE_CASE: Symbol.for('CreateMissionUseCase'),
  UPDATE_MISSION_USE_CASE: Symbol.for('UpdateMissionUseCase'),
  DELETE_MISSION_USE_CASE: Symbol.for('DeleteMissionUseCase'),
  GET_MISSION_USE_CASE: Symbol.for('GetMissionUseCase'),
  COMPLETE_MISSION_USE_CASE: Symbol.for('CompleteMissionUseCase'),
  GET_ACTIVE_MISSIONS_USE_CASE: Symbol.for('GetActiveMissionsUseCase'),
  // User Gamification
  ADD_XP_USE_CASE: Symbol.for('AddXpUseCase'),
  ADD_COINS_USE_CASE: Symbol.for('AddCoinsUseCase'),
  GET_USER_GAMIFICATION_PROFILE_USE_CASE: Symbol.for('GetUserGamificationProfileUseCase'),
  GET_LEADERBOARD_USE_CASE: Symbol.for('GetLeaderboardUseCase'),

  // Use Cases - Productivity
  // Tasks
  CREATE_TASK_USE_CASE: Symbol.for('CreateTaskUseCase'),
  UPDATE_TASK_USE_CASE: Symbol.for('UpdateTaskUseCase'),
  DELETE_TASK_USE_CASE: Symbol.for('DeleteTaskUseCase'),
  GET_TASK_USE_CASE: Symbol.for('GetTaskUseCase'),
  COMPLETE_TASK_USE_CASE: Symbol.for('CompleteTaskUseCase'),
  CANCEL_TASK_USE_CASE: Symbol.for('CancelTaskUseCase'),
  GET_USER_TASKS_USE_CASE: Symbol.for('GetUserTasksUseCase'),
  // Calendar Events
  CREATE_EVENT_USE_CASE: Symbol.for('CreateEventUseCase'),
  UPDATE_EVENT_USE_CASE: Symbol.for('UpdateEventUseCase'),
  DELETE_EVENT_USE_CASE: Symbol.for('DeleteEventUseCase'),
  GET_EVENT_USE_CASE: Symbol.for('GetEventUseCase'),
  GET_USER_EVENTS_USE_CASE: Symbol.for('GetUserEventsUseCase'),
  RESCHEDULE_EVENT_USE_CASE: Symbol.for('RescheduleEventUseCase'),

  // Use Cases - File
  UPLOAD_FILE_USE_CASE: Symbol.for('UploadFileUseCase'),
  GET_FILE_USE_CASE: Symbol.for('GetFileUseCase'),
  UPDATE_FILE_USE_CASE: Symbol.for('UpdateFileUseCase'),
  DELETE_FILE_USE_CASE: Symbol.for('DeleteFileUseCase'),
  SEARCH_FILES_USE_CASE: Symbol.for('SearchFilesUseCase'),
} as const;

/**
 * Decorator for dependency injection
 */
export function injectable(token: string | symbol) {
  return <T extends { new (...args: unknown[]): unknown }>(
    constructor: T
  ) => {
    container.register(token, constructor);
    return constructor;
  };
}

/**
 * Decorator for injecting dependencies
 */
export function inject(token: string | symbol) {
  return (
    target: unknown,
    propertyKey: string,
    parameterIndex: number
  ) => {
    // Store metadata for later injection
    const existingInjections =
      Reflect.getMetadata('injections', target) || {};
    existingInjections[parameterIndex] = token;
    Reflect.defineMetadata('injections', existingInjections, target);
  };
}

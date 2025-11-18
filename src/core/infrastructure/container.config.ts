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

// Quiz Module
import { QuizRepository } from '@/modules/quiz/infrastructure/quiz.repository';
import {
  CreateQuizUseCase,
  UpdateQuizUseCase,
  GetQuizUseCase,
  DeleteQuizUseCase,
} from '@/modules/quiz/application/use-cases';

// Assignment Module
import { AssignmentRepository } from '@/modules/assignment/infrastructure/assignment.repository';
import {
  CreateAssignmentUseCase,
  UpdateAssignmentUseCase,
  GetAssignmentUseCase,
  DeleteAssignmentUseCase,
  SubmitAssignmentUseCase,
  GradeAssignmentUseCase,
} from '@/modules/assignment/application/use-cases';

// Enrollment Module
import { EnrollmentRepository } from '@/modules/enrollment/infrastructure/enrollment.repository';
import {
  EnrollStudentUseCase,
  UpdateProgressUseCase,
  GetEnrollmentUseCase,
  CompleteEnrollmentUseCase,
} from '@/modules/enrollment/application/use-cases';

// Notification Module
import { NotificationRepository } from '@/modules/notification/infrastructure/notification.repository';
import {
  CreateNotificationUseCase,
  MarkAsReadUseCase,
  GetNotificationsUseCase,
  GetUnreadCountUseCase,
} from '@/modules/notification/application/use-cases';

// Message Module
import { MessageRepository } from '@/modules/message/infrastructure/message.repository';
import { ConversationRepository } from '@/modules/message/infrastructure/conversation.repository';
import {
  SendMessageUseCase,
  GetConversationUseCase,
  GetOrCreateConversationUseCase,
  MarkMessagesAsReadUseCase,
  GetConversationsUseCase,
} from '@/modules/message/application/use-cases';

// Learning Path Module
import { LearningPathRepository } from '@/modules/learning-path/infrastructure/learning-path.repository';
import {
  CreateLearningPathUseCase,
  UpdateLearningPathUseCase,
  AddNodeUseCase,
  AddEdgeUseCase,
  StartLearningPathUseCase,
  CompleteNodeUseCase,
  GetNextNodeUseCase,
  GetUserProgressUseCase,
} from '@/modules/learning-path/application/use-cases';

// Gamification Module
import { BadgeRepository } from '@/modules/gamification/infrastructure/badge.repository';
import { AchievementRepository } from '@/modules/gamification/infrastructure/achievement.repository';
import { MissionRepository } from '@/modules/gamification/infrastructure/mission.repository';
import { UserGamificationRepository } from '@/modules/gamification/infrastructure/user-gamification.repository';
import {
  CreateBadgeUseCase,
  UpdateBadgeUseCase,
  GetBadgeUseCase,
  DeleteBadgeUseCase,
  AwardBadgeUseCase,
  GetUserBadgesUseCase,
  CreateAchievementUseCase,
  UpdateAchievementUseCase,
  GetAchievementUseCase,
  DeleteAchievementUseCase,
  UnlockAchievementUseCase,
  GetUserAchievementsUseCase,
  CreateMissionUseCase,
  UpdateMissionUseCase,
  GetMissionUseCase,
  DeleteMissionUseCase,
  CompleteMissionUseCase,
  GetActiveMissionsUseCase,
  AddXpUseCase,
  AddCoinsUseCase,
  GetUserGamificationProfileUseCase,
  GetLeaderboardUseCase,
} from '@/modules/gamification/application/use-cases';

// Productivity Module
import { PersonalTaskRepository } from '@/modules/productivity/infrastructure/personal-task.repository';
import { CalendarEventRepository } from '@/modules/productivity/infrastructure/calendar-event.repository';
import {
  CreateTaskUseCase,
  UpdateTaskUseCase,
  GetTaskUseCase,
  DeleteTaskUseCase,
  CompleteTaskUseCase,
  CancelTaskUseCase,
  GetUserTasksUseCase,
  CreateEventUseCase,
  UpdateEventUseCase,
  GetEventUseCase,
  DeleteEventUseCase,
  GetUserEventsUseCase,
  RescheduleEventUseCase,
} from '@/modules/productivity/application/use-cases';

// File Module
import { FileRepository } from '@/modules/file/infrastructure/file.repository';
import {
  UploadFileUseCase,
  GetFileUseCase,
  UpdateFileUseCase,
  DeleteFileUseCase,
  SearchFilesUseCase,
} from '@/modules/file/application/use-cases';

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

  // Quiz Module Repositories
  container.register(
    TOKENS.QUIZ_REPOSITORY,
    () => new QuizRepository()
  );

  // Quiz Module Use Cases
  container.register(
    TOKENS.CREATE_QUIZ_USE_CASE,
    () =>
      new CreateQuizUseCase(
        container.resolve(TOKENS.QUIZ_REPOSITORY)
      )
  );

  container.register(
    TOKENS.UPDATE_QUIZ_USE_CASE,
    () =>
      new UpdateQuizUseCase(
        container.resolve(TOKENS.QUIZ_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_QUIZ_USE_CASE,
    () =>
      new GetQuizUseCase(
        container.resolve(TOKENS.QUIZ_REPOSITORY)
      )
  );

  container.register(
    TOKENS.DELETE_QUIZ_USE_CASE,
    () =>
      new DeleteQuizUseCase(
        container.resolve(TOKENS.QUIZ_REPOSITORY)
      )
  );

  // Assignment Module Repositories
  container.register(
    TOKENS.ASSIGNMENT_REPOSITORY,
    () => new AssignmentRepository()
  );

  // Assignment Module Use Cases
  container.register(
    TOKENS.CREATE_ASSIGNMENT_USE_CASE,
    () =>
      new CreateAssignmentUseCase(
        container.resolve(TOKENS.ASSIGNMENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.UPDATE_ASSIGNMENT_USE_CASE,
    () =>
      new UpdateAssignmentUseCase(
        container.resolve(TOKENS.ASSIGNMENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_ASSIGNMENT_USE_CASE,
    () =>
      new GetAssignmentUseCase(
        container.resolve(TOKENS.ASSIGNMENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.DELETE_ASSIGNMENT_USE_CASE,
    () =>
      new DeleteAssignmentUseCase(
        container.resolve(TOKENS.ASSIGNMENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.SUBMIT_ASSIGNMENT_USE_CASE,
    () =>
      new SubmitAssignmentUseCase(
        container.resolve(TOKENS.ASSIGNMENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GRADE_ASSIGNMENT_USE_CASE,
    () =>
      new GradeAssignmentUseCase(
        container.resolve(TOKENS.ASSIGNMENT_REPOSITORY)
      )
  );

  // Enrollment Module Repositories
  container.register(
    TOKENS.ENROLLMENT_REPOSITORY,
    () => new EnrollmentRepository()
  );

  // Enrollment Module Use Cases
  container.register(
    TOKENS.ENROLL_STUDENT_USE_CASE,
    () =>
      new EnrollStudentUseCase(
        container.resolve(TOKENS.ENROLLMENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.UPDATE_PROGRESS_USE_CASE,
    () =>
      new UpdateProgressUseCase(
        container.resolve(TOKENS.ENROLLMENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_ENROLLMENT_USE_CASE,
    () =>
      new GetEnrollmentUseCase(
        container.resolve(TOKENS.ENROLLMENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.COMPLETE_ENROLLMENT_USE_CASE,
    () =>
      new CompleteEnrollmentUseCase(
        container.resolve(TOKENS.ENROLLMENT_REPOSITORY)
      )
  );

  // Notification Module Repositories
  container.register(
    TOKENS.NOTIFICATION_REPOSITORY,
    () => new NotificationRepository()
  );

  // Notification Module Use Cases
  container.register(
    TOKENS.CREATE_NOTIFICATION_USE_CASE,
    () =>
      new CreateNotificationUseCase(
        container.resolve(TOKENS.NOTIFICATION_REPOSITORY)
      )
  );

  container.register(
    TOKENS.MARK_NOTIFICATION_AS_READ_USE_CASE,
    () =>
      new MarkAsReadUseCase(
        container.resolve(TOKENS.NOTIFICATION_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_NOTIFICATIONS_USE_CASE,
    () =>
      new GetNotificationsUseCase(
        container.resolve(TOKENS.NOTIFICATION_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_UNREAD_COUNT_USE_CASE,
    () =>
      new GetUnreadCountUseCase(
        container.resolve(TOKENS.NOTIFICATION_REPOSITORY)
      )
  );

  // Message Module Repositories
  container.register(
    TOKENS.MESSAGE_REPOSITORY,
    () => new MessageRepository()
  );

  container.register(
    TOKENS.CONVERSATION_REPOSITORY,
    () => new ConversationRepository()
  );

  // Message Module Use Cases
  container.register(
    TOKENS.SEND_MESSAGE_USE_CASE,
    () =>
      new SendMessageUseCase(
        container.resolve(TOKENS.MESSAGE_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_CONVERSATION_USE_CASE,
    () =>
      new GetConversationUseCase(
        container.resolve(TOKENS.CONVERSATION_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_OR_CREATE_CONVERSATION_USE_CASE,
    () =>
      new GetOrCreateConversationUseCase(
        container.resolve(TOKENS.CONVERSATION_REPOSITORY)
      )
  );

  container.register(
    TOKENS.MARK_MESSAGES_AS_READ_USE_CASE,
    () =>
      new MarkMessagesAsReadUseCase(
        container.resolve(TOKENS.MESSAGE_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_CONVERSATIONS_USE_CASE,
    () =>
      new GetConversationsUseCase(
        container.resolve(TOKENS.CONVERSATION_REPOSITORY)
      )
  );

  // Learning Path Module Repositories
  container.register(
    TOKENS.LEARNING_PATH_REPOSITORY,
    () => new LearningPathRepository()
  );

  // Learning Path Module Use Cases
  container.register(
    TOKENS.CREATE_LEARNING_PATH_USE_CASE,
    () =>
      new CreateLearningPathUseCase(
        container.resolve(TOKENS.LEARNING_PATH_REPOSITORY)
      )
  );

  container.register(
    TOKENS.UPDATE_LEARNING_PATH_USE_CASE,
    () =>
      new UpdateLearningPathUseCase(
        container.resolve(TOKENS.LEARNING_PATH_REPOSITORY)
      )
  );

  container.register(
    TOKENS.ADD_NODE_USE_CASE,
    () =>
      new AddNodeUseCase(
        container.resolve(TOKENS.LEARNING_PATH_REPOSITORY)
      )
  );

  container.register(
    TOKENS.ADD_EDGE_USE_CASE,
    () =>
      new AddEdgeUseCase(
        container.resolve(TOKENS.LEARNING_PATH_REPOSITORY)
      )
  );

  container.register(
    TOKENS.START_LEARNING_PATH_USE_CASE,
    () =>
      new StartLearningPathUseCase(
        container.resolve(TOKENS.LEARNING_PATH_REPOSITORY)
      )
  );

  container.register(
    TOKENS.COMPLETE_NODE_USE_CASE,
    () =>
      new CompleteNodeUseCase(
        container.resolve(TOKENS.LEARNING_PATH_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_NEXT_NODE_USE_CASE,
    () =>
      new GetNextNodeUseCase(
        container.resolve(TOKENS.LEARNING_PATH_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_USER_PROGRESS_USE_CASE,
    () =>
      new GetUserProgressUseCase(
        container.resolve(TOKENS.LEARNING_PATH_REPOSITORY)
      )
  );

  // Gamification Module Repositories
  container.register(
    TOKENS.BADGE_REPOSITORY,
    () => new BadgeRepository()
  );

  container.register(
    TOKENS.ACHIEVEMENT_REPOSITORY,
    () => new AchievementRepository()
  );

  container.register(
    TOKENS.MISSION_REPOSITORY,
    () => new MissionRepository()
  );

  container.register(
    TOKENS.USER_GAMIFICATION_REPOSITORY,
    () => new UserGamificationRepository()
  );

  // Gamification Module Use Cases - Badges
  container.register(
    TOKENS.CREATE_BADGE_USE_CASE,
    () =>
      new CreateBadgeUseCase(
        container.resolve(TOKENS.BADGE_REPOSITORY)
      )
  );

  container.register(
    TOKENS.UPDATE_BADGE_USE_CASE,
    () =>
      new UpdateBadgeUseCase(
        container.resolve(TOKENS.BADGE_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_BADGE_USE_CASE,
    () =>
      new GetBadgeUseCase(
        container.resolve(TOKENS.BADGE_REPOSITORY)
      )
  );

  container.register(
    TOKENS.DELETE_BADGE_USE_CASE,
    () =>
      new DeleteBadgeUseCase(
        container.resolve(TOKENS.BADGE_REPOSITORY)
      )
  );

  container.register(
    TOKENS.AWARD_BADGE_USE_CASE,
    () =>
      new AwardBadgeUseCase(
        container.resolve(TOKENS.BADGE_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_USER_BADGES_USE_CASE,
    () =>
      new GetUserBadgesUseCase(
        container.resolve(TOKENS.BADGE_REPOSITORY)
      )
  );

  // Gamification Module Use Cases - Achievements
  container.register(
    TOKENS.CREATE_ACHIEVEMENT_USE_CASE,
    () =>
      new CreateAchievementUseCase(
        container.resolve(TOKENS.ACHIEVEMENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.UPDATE_ACHIEVEMENT_USE_CASE,
    () =>
      new UpdateAchievementUseCase(
        container.resolve(TOKENS.ACHIEVEMENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_ACHIEVEMENT_USE_CASE,
    () =>
      new GetAchievementUseCase(
        container.resolve(TOKENS.ACHIEVEMENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.DELETE_ACHIEVEMENT_USE_CASE,
    () =>
      new DeleteAchievementUseCase(
        container.resolve(TOKENS.ACHIEVEMENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.UNLOCK_ACHIEVEMENT_USE_CASE,
    () =>
      new UnlockAchievementUseCase(
        container.resolve(TOKENS.ACHIEVEMENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_USER_ACHIEVEMENTS_USE_CASE,
    () =>
      new GetUserAchievementsUseCase(
        container.resolve(TOKENS.ACHIEVEMENT_REPOSITORY)
      )
  );

  // Gamification Module Use Cases - Missions
  container.register(
    TOKENS.CREATE_MISSION_USE_CASE,
    () =>
      new CreateMissionUseCase(
        container.resolve(TOKENS.MISSION_REPOSITORY)
      )
  );

  container.register(
    TOKENS.UPDATE_MISSION_USE_CASE,
    () =>
      new UpdateMissionUseCase(
        container.resolve(TOKENS.MISSION_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_MISSION_USE_CASE,
    () =>
      new GetMissionUseCase(
        container.resolve(TOKENS.MISSION_REPOSITORY)
      )
  );

  container.register(
    TOKENS.DELETE_MISSION_USE_CASE,
    () =>
      new DeleteMissionUseCase(
        container.resolve(TOKENS.MISSION_REPOSITORY)
      )
  );

  container.register(
    TOKENS.COMPLETE_MISSION_USE_CASE,
    () =>
      new CompleteMissionUseCase(
        container.resolve(TOKENS.MISSION_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_ACTIVE_MISSIONS_USE_CASE,
    () =>
      new GetActiveMissionsUseCase(
        container.resolve(TOKENS.MISSION_REPOSITORY)
      )
  );

  // Gamification Module Use Cases - User Gamification
  container.register(
    TOKENS.ADD_XP_USE_CASE,
    () =>
      new AddXpUseCase(
        container.resolve(TOKENS.USER_GAMIFICATION_REPOSITORY)
      )
  );

  container.register(
    TOKENS.ADD_COINS_USE_CASE,
    () =>
      new AddCoinsUseCase(
        container.resolve(TOKENS.USER_GAMIFICATION_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_USER_GAMIFICATION_PROFILE_USE_CASE,
    () =>
      new GetUserGamificationProfileUseCase(
        container.resolve(TOKENS.USER_GAMIFICATION_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_LEADERBOARD_USE_CASE,
    () =>
      new GetLeaderboardUseCase(
        container.resolve(TOKENS.USER_GAMIFICATION_REPOSITORY)
      )
  );

  // Productivity Module Repositories
  container.register(
    TOKENS.PERSONAL_TASK_REPOSITORY,
    () => new PersonalTaskRepository()
  );

  container.register(
    TOKENS.CALENDAR_EVENT_REPOSITORY,
    () => new CalendarEventRepository()
  );

  // Productivity Module Use Cases - Tasks
  container.register(
    TOKENS.CREATE_TASK_USE_CASE,
    () =>
      new CreateTaskUseCase(
        container.resolve(TOKENS.PERSONAL_TASK_REPOSITORY)
      )
  );

  container.register(
    TOKENS.UPDATE_TASK_USE_CASE,
    () =>
      new UpdateTaskUseCase(
        container.resolve(TOKENS.PERSONAL_TASK_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_TASK_USE_CASE,
    () =>
      new GetTaskUseCase(
        container.resolve(TOKENS.PERSONAL_TASK_REPOSITORY)
      )
  );

  container.register(
    TOKENS.DELETE_TASK_USE_CASE,
    () =>
      new DeleteTaskUseCase(
        container.resolve(TOKENS.PERSONAL_TASK_REPOSITORY)
      )
  );

  container.register(
    TOKENS.COMPLETE_TASK_USE_CASE,
    () =>
      new CompleteTaskUseCase(
        container.resolve(TOKENS.PERSONAL_TASK_REPOSITORY)
      )
  );

  container.register(
    TOKENS.CANCEL_TASK_USE_CASE,
    () =>
      new CancelTaskUseCase(
        container.resolve(TOKENS.PERSONAL_TASK_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_USER_TASKS_USE_CASE,
    () =>
      new GetUserTasksUseCase(
        container.resolve(TOKENS.PERSONAL_TASK_REPOSITORY)
      )
  );

  // Productivity Module Use Cases - Calendar Events
  container.register(
    TOKENS.CREATE_EVENT_USE_CASE,
    () =>
      new CreateEventUseCase(
        container.resolve(TOKENS.CALENDAR_EVENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.UPDATE_EVENT_USE_CASE,
    () =>
      new UpdateEventUseCase(
        container.resolve(TOKENS.CALENDAR_EVENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_EVENT_USE_CASE,
    () =>
      new GetEventUseCase(
        container.resolve(TOKENS.CALENDAR_EVENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.DELETE_EVENT_USE_CASE,
    () =>
      new DeleteEventUseCase(
        container.resolve(TOKENS.CALENDAR_EVENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_USER_EVENTS_USE_CASE,
    () =>
      new GetUserEventsUseCase(
        container.resolve(TOKENS.CALENDAR_EVENT_REPOSITORY)
      )
  );

  container.register(
    TOKENS.RESCHEDULE_EVENT_USE_CASE,
    () =>
      new RescheduleEventUseCase(
        container.resolve(TOKENS.CALENDAR_EVENT_REPOSITORY)
      )
  );

  // File Module Repositories
  container.register(
    TOKENS.FILE_REPOSITORY,
    () => new FileRepository()
  );

  // File Module Use Cases
  container.register(
    TOKENS.UPLOAD_FILE_USE_CASE,
    () =>
      new UploadFileUseCase(
        container.resolve(TOKENS.FILE_REPOSITORY)
      )
  );

  container.register(
    TOKENS.GET_FILE_USE_CASE,
    () =>
      new GetFileUseCase(
        container.resolve(TOKENS.FILE_REPOSITORY)
      )
  );

  container.register(
    TOKENS.UPDATE_FILE_USE_CASE,
    () =>
      new UpdateFileUseCase(
        container.resolve(TOKENS.FILE_REPOSITORY)
      )
  );

  container.register(
    TOKENS.DELETE_FILE_USE_CASE,
    () =>
      new DeleteFileUseCase(
        container.resolve(TOKENS.FILE_REPOSITORY)
      )
  );

  container.register(
    TOKENS.SEARCH_FILES_USE_CASE,
    () =>
      new SearchFilesUseCase(
        container.resolve(TOKENS.FILE_REPOSITORY)
      )
  );
}

/**
 * Get a use case instance from the container
 */
export function getUseCase<T>(token: symbol): T {
  return container.resolve<T>(token);
}

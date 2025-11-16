/**
 * Calendar Module - Índice principal
 * Exporta toda la API y utilidades de calendario
 */

// API
export { CalendarAPI, calendarAPI } from './calendar-api'
// Re-export common imports for convenience
export type {
  BlockedTime,
  CalendarEventBase,
  CalendarEventInput,
  CalendarUserConfig,
  CalendarViewSettings,
  VisibleHoursRange
} from './calendar-types'
// Types
export * from './calendar-types'
export {
  BlockType,
  CalendarView,
  EventPriority,
  EventStatus,
  EventType,
  RecurrenceType,
  ReminderType
} from './calendar-types'
// Date Utilities
export * from './date-utils'

/**
 * Tipos e interfaces para el sistema de calendario
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum EventType {
  PERSONAL = 'PERSONAL',
  COURSE = 'COURSE',
  MEETING = 'MEETING',
  SUBMISSION = 'SUBMISSION',
  EXAM = 'EXAM',
  DEADLINE = 'DEADLINE',
  BIRTHDAY = 'BIRTHDAY',
  HOLIDAY = 'HOLIDAY',
  REMINDER = 'REMINDER',
  OTHER = 'OTHER'
}

export enum RecurrenceType {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM'
}

export enum ReminderType {
  NONE = 'NONE',
  AT_TIME = 'AT_TIME',
  BEFORE_15MIN = 'BEFORE_15MIN',
  BEFORE_30MIN = 'BEFORE_30MIN',
  BEFORE_1HOUR = 'BEFORE_1HOUR',
  BEFORE_1DAY = 'BEFORE_1DAY',
  BEFORE_1WEEK = 'BEFORE_1WEEK'
}

export enum CalendarView {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
  AGENDA = 'AGENDA',
  SCHEDULE = 'SCHEDULE'
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum EventPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface CalendarEventBase {
  id: string
  userId: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  allDay: boolean
  location?: string
  color?: string
  type: EventType
  status: EventStatus
  priority?: EventPriority
  reminders?: ReminderConfig[]
  recurrence?: RecurrenceConfig
  tags?: string[]
  attendees?: EventAttendee[]
  attachments?: EventAttachment[]
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface ReminderConfig {
  id?: string
  type: ReminderType
  customMinutesBefore?: number
  notificationMethod?: 'EMAIL' | 'PUSH' | 'SMS'
  enabled: boolean
}

export interface RecurrenceConfig {
  type: RecurrenceType
  interval?: number
  daysOfWeek?: number[]
  daysOfMonth?: number[]
  endDate?: Date
  occurrences?: number
  weekStartDay?: number
  excludeDates?: Date[]
}

export interface EventAttendee {
  id?: string
  email: string
  name?: string
  status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE'
  role?: 'ORGANIZER' | 'REQUIRED' | 'OPTIONAL'
}

export interface EventAttachment {
  id?: string
  name: string
  url: string
  mimeType?: string
  size?: number
  uploadedAt?: Date
}

export interface CalendarEventInput {
  title: string
  description?: string
  startDate: Date | string
  endDate: Date | string
  allDay?: boolean
  location?: string
  color?: string
  type?: EventType
  status?: EventStatus
  priority?: EventPriority
  reminders?: ReminderConfig[]
  recurrence?: RecurrenceConfig
  tags?: string[]
  attendees?: EventAttendee[]
  metadata?: Record<string, any>
}

// ============================================================================
// FILTER & SEARCH
// ============================================================================

export interface CalendarFilterOptions {
  userId: string
  fromDate?: Date | string
  toDate?: Date | string
  types?: EventType[]
  status?: EventStatus[]
  priority?: EventPriority[]
  tags?: string[]
  search?: string
  location?: string
  isAllDay?: boolean
  includeArchived?: boolean
  limit?: number
  offset?: number
}

export interface CalendarSearchQuery {
  query: string
  fields?: Array<'title' | 'description' | 'location' | 'tags'>
  fuzzy?: boolean
  limit?: number
}

// ============================================================================
// RANGE & PERIOD
// ============================================================================

export interface DateRange {
  from: Date
  to: Date
}

export interface DatePeriod {
  year?: number
  month?: number
  week?: number
  day?: Date
}

export interface TimeSlot {
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  day?: number // 0-6 (Sunday-Saturday)
}

// ============================================================================
// CALENDAR STATE & OPERATIONS
// ============================================================================

export interface CalendarState {
  currentView: CalendarView
  currentDate: Date
  selectedDate?: Date
  selectedEvents?: string[]
  filters?: CalendarFilterOptions
  isLoading: boolean
  error?: string
}

export interface CalendarOperation {
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'BULK_DELETE' | 'ARCHIVE' | 'RESTORE'
  eventId?: string
  eventIds?: string[]
  timestamp: Date
  userId: string
}

// ============================================================================
// RESPONSES
// ============================================================================

export interface CalendarResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: Date
}

export interface CalendarListResponse<T> {
  success: boolean
  data: T[]
  total: number
  offset: number
  limit: number
  timestamp: Date
}

// ============================================================================
// AGGREGATION & STATISTICS
// ============================================================================

export interface EventStatistics {
  total: number
  byType: Record<EventType, number>
  byStatus: Record<EventStatus, number>
  byPriority: Record<EventPriority, number>
  upcomingCount: number
  overdueCount: number
  completedCount: number
}

export interface CalendarStats {
  totalEvents: number
  eventsThisWeek: number
  eventsThisMonth: number
  averageEventsPerDay: number
  busiestDay: string
  busiestMonth: string
  eventStats: EventStatistics
}

// ============================================================================
// CONFLICT & AVAILABILITY
// ============================================================================

export interface TimeConflict {
  eventId: string
  conflictingEventId: string
  overlapStart: Date
  overlapEnd: Date
  duration: number // in minutes
}

export interface AvailabilitySlot {
  startDate: Date
  endDate: Date
  duration: number // in minutes
  isFree: boolean
}

export interface BusyTime {
  startDate: Date
  endDate: Date
  events: string[] // Event IDs
}

// ============================================================================
// EXPORT & SYNC
// ============================================================================

export interface CalendarExportOptions {
  format: 'ICS' | 'JSON' | 'CSV'
  includeAttendees?: boolean
  includeAttachments?: boolean
  dateRange?: DateRange
  types?: EventType[]
}

export interface CalendarSyncOptions {
  lastSync?: Date
  includeDeleted?: boolean
  maxResults?: number
}

export interface SyncResult {
  added: string[]
  updated: string[]
  deleted: string[]
  failed: string[]
  timestamp: Date
}

// ============================================================================
// CALENDAR CONFIGURATION
// ============================================================================

export enum BlockType {
  TIME_SLOT = 'TIME_SLOT',
  FULL_DAY = 'FULL_DAY',
  RECURRING = 'RECURRING',
  RANGE = 'RANGE'
}

export interface BlockedTime {
  id?: string
  userId: string
  type: BlockType
  title: string
  description?: string
  reason?: string
  startDate: Date
  endDate: Date
  startTime?: string // HH:mm format for daily blocks
  endTime?: string // HH:mm format for daily blocks
  daysOfWeek?: number[] // 0-6 (Sunday-Saturday) for recurring blocks
  recurrence?: RecurrenceConfig
  isRecurring: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface VisibleHoursRange {
  startHour: number // 0-23
  endHour: number // 0-23
  applyToAllDays?: boolean
  daysOfWeek?: number[] // 0-6 if not applying to all days
}

export interface CalendarViewSettings {
  visibleHours?: VisibleHoursRange
  defaultView?: CalendarView
  weekStartDay?: number // 0-6
  showWeekends?: boolean
  showWeekNumbers?: boolean
  highlightWeekends?: boolean
  highlightToday?: boolean
  workingHours?: {
    startHour: number
    endHour: number
    daysOfWeek: number[]
  }
}

export interface CalendarUserConfig {
  userId: string
  viewSettings?: CalendarViewSettings
  blockedTimes?: BlockedTime[]
  holidays?: BlockedTime[]
  workingHours?: {
    monday: TimeSlot[]
    tuesday: TimeSlot[]
    wednesday: TimeSlot[]
    thursday: TimeSlot[]
    friday: TimeSlot[]
    saturday: TimeSlot[]
    sunday: TimeSlot[]
  }
  timezone?: string
  language?: string
  locale?: string
  theme?: 'light' | 'dark' | 'auto'
  createdAt?: Date
  updatedAt?: Date
}

// ============================================================================
// COLOR & STYLING
// ============================================================================

export const EventTypeColors: Record<EventType, string> = {
  [EventType.PERSONAL]: '#3b82f6',
  [EventType.COURSE]: '#8b5cf6',
  [EventType.MEETING]: '#ec4899',
  [EventType.SUBMISSION]: '#f59e0b',
  [EventType.EXAM]: '#ef4444',
  [EventType.DEADLINE]: '#f97316',
  [EventType.BIRTHDAY]: '#06b6d4',
  [EventType.HOLIDAY]: '#10b981',
  [EventType.REMINDER]: '#6366f1',
  [EventType.OTHER]: '#6b7280'
}

export const EventPriorityColors: Record<EventPriority, string> = {
  [EventPriority.LOW]: '#10b981',
  [EventPriority.MEDIUM]: '#f59e0b',
  [EventPriority.HIGH]: '#ef4444',
  [EventPriority.URGENT]: '#7c2d12'
}

export const EventStatusColors: Record<EventStatus, string> = {
  [EventStatus.DRAFT]: '#9ca3af',
  [EventStatus.SCHEDULED]: '#3b82f6',
  [EventStatus.IN_PROGRESS]: '#f59e0b',
  [EventStatus.COMPLETED]: '#10b981',
  [EventStatus.CANCELLED]: '#6b7280'
}

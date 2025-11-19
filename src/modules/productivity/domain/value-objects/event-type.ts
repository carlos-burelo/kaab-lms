/**
 * Event Type Value Object
 */

export enum EventType {
  PERSONAL = 'PERSONAL',
  COURSE = 'COURSE',
  MEETING = 'MEETING',
  SUBMISSION = 'SUBMISSION',
  EXAM = 'EXAM',
  OTHER = 'OTHER'
}

export function isValidEventType(value: string): value is EventType {
  return Object.values(EventType).includes(value as EventType)
}

export function getEventTypeColor(type: EventType): string {
  const colors: Record<EventType, string> = {
    [EventType.PERSONAL]: '#3b82f6', // blue
    [EventType.COURSE]: '#10b981', // green
    [EventType.MEETING]: '#8b5cf6', // purple
    [EventType.SUBMISSION]: '#f59e0b', // amber
    [EventType.EXAM]: '#ef4444', // red
    [EventType.OTHER]: '#6b7280' // gray
  }
  return colors[type]
}

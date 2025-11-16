/**
 * Utilidades de fecha y hora para operaciones de calendario
 */

import { type DateRange, RecurrenceType } from './calendar-types'

/**
 * ============================================================================
 * CONVERSIONES Y FORMATEO
 * ============================================================================
 */

/**
 * Formatear fecha a string ISO
 */
export function formatDateISO(date: Date): string {
  return date.toISOString()
}

/**
 * Formatear hora en formato HH:mm
 */
export function formatTime(date: Date, includeSeconds: boolean = false): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  if (includeSeconds) {
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  return `${hours}:${minutes}`
}

/**
 * Formatear fecha en formato legible
 */
export function formatDateReadable(date: Date, locale: string = 'es-ES'): string {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Formatear fecha y hora en formato legible
 */
export function formatDateTime(date: Date, locale: string = 'es-ES'): string {
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Parsear hora de string (HH:mm)
 */
export function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return { hours, minutes }
}

/**
 * Crear Date desde hora string
 */
export function createTimeOnDate(date: Date, timeStr: string): Date {
  const { hours, minutes } = parseTimeString(timeStr)
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

/**
 * ============================================================================
 * CÁLCULOS DE FECHA
 * ============================================================================
 */

/**
 * Obtener inicio del día
 */
export function getDayStart(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Obtener fin del día
 */
export function getDayEnd(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Obtener inicio de la semana
 */
export function getWeekStart(date: Date, startDay: number = 0): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + startDay
  const result = new Date(d.setDate(diff))
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Obtener fin de la semana
 */
export function getWeekEnd(date: Date, startDay: number = 0): Date {
  const start = getWeekStart(date, startDay)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  end.setHours(23, 59, 59, 999)
  return end
}

/**
 * Obtener primer día del mes
 */
export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

/**
 * Obtener último día del mes
 */
export function getMonthEnd(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Obtener primer día del año
 */
export function getYearStart(year: number): Date {
  return new Date(year, 0, 1, 0, 0, 0, 0)
}

/**
 * Obtener último día del año
 */
export function getYearEnd(year: number): Date {
  const d = new Date(year, 11, 31)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Sumar días a una fecha
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Sumar horas a una fecha
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}

/**
 * Sumar minutos a una fecha
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date)
  result.setMinutes(result.getMinutes() + minutes)
  return result
}

/**
 * Sumar semanas a una fecha
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7)
}

/**
 * Sumar meses a una fecha
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Sumar años a una fecha
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

/**
 * ============================================================================
 * COMPARACIONES
 * ============================================================================
 */

/**
 * Verificar si dos fechas son el mismo día
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate()
  )
}

/**
 * Verificar si dos fechas son la misma semana
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  const week1 = getWeekStart(date1)
  const week2 = getWeekStart(date2)
  return isSameDay(week1, week2)
}

/**
 * Verificar si dos fechas son el mismo mes
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth()
}

/**
 * Verificar si dos fechas son el mismo año
 */
export function isSameYear(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear()
}

/**
 * Verificar si date1 es antes que date2
 */
export function isBefore(date1: Date, date2: Date): boolean {
  return date1.getTime() < date2.getTime()
}

/**
 * Verificar si date1 es después que date2
 */
export function isAfter(date1: Date, date2: Date): boolean {
  return date1.getTime() > date2.getTime()
}

/**
 * Verificar si una fecha está dentro de un rango
 */
export function isDateInRange(date: Date, range: DateRange): boolean {
  return date >= range.from && date <= range.to
}

/**
 * Verificar si una fecha es hoy
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

/**
 * Verificar si una fecha es pasada
 */
export function isPast(date: Date): boolean {
  return isBefore(date, new Date())
}

/**
 * Verificar si una fecha es futura
 */
export function isFuture(date: Date): boolean {
  return isAfter(date, new Date())
}

/**
 * ============================================================================
 * DURACIONES Y DIFERENCIAS
 * ============================================================================
 */

/**
 * Obtener diferencia en milisegundos
 */
export function getMillisecondsBetween(date1: Date, date2: Date): number {
  return Math.abs(date2.getTime() - date1.getTime())
}

/**
 * Obtener diferencia en segundos
 */
export function getSecondsBetween(date1: Date, date2: Date): number {
  return Math.floor(getMillisecondsBetween(date1, date2) / 1000)
}

/**
 * Obtener diferencia en minutos
 */
export function getMinutesBetween(date1: Date, date2: Date): number {
  return Math.floor(getMillisecondsBetween(date1, date2) / (1000 * 60))
}

/**
 * Obtener diferencia en horas
 */
export function getHoursBetween(date1: Date, date2: Date): number {
  return Math.floor(getMillisecondsBetween(date1, date2) / (1000 * 60 * 60))
}

/**
 * Obtener diferencia en días
 */
export function getDaysBetween(date1: Date, date2: Date): number {
  return Math.floor(getMillisecondsBetween(date1, date2) / (1000 * 60 * 60 * 24))
}

/**
 * Obtener diferencia en semanas
 */
export function getWeeksBetween(date1: Date, date2: Date): number {
  return Math.floor(getDaysBetween(date1, date2) / 7)
}

/**
 * Obtener diferencia en meses
 */
export function getMonthsBetween(date1: Date, date2: Date): number {
  let d1 = new Date(date1)
  let d2 = new Date(date2)

  let months = 0

  if (d1 > d2) {
    ;[d1, d2] = [d2, d1]
  }

  while (addMonths(d1, months + 1) <= d2) {
    months++
  }

  return months
}

/**
 * Obtener duración legible (ej: "2h 30m")
 */
export function getDurationReadable(startDate: Date, endDate: Date): string {
  const minutes = getMinutesBetween(startDate, endDate)

  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (mins === 0) {
    return `${hours}h`
  }

  return `${hours}h ${mins}m`
}

/**
 * ============================================================================
 * RECURRENCIA
 * ============================================================================
 */

/**
 * Generar fechas de recurrencia
 */
export function generateRecurrenceDates(startDate: Date, type: RecurrenceType, endDate?: Date, occurrences?: number): Date[] {
  const dates: Date[] = [new Date(startDate)]
  let current = new Date(startDate)
  let count = 1

  const limit = endDate || addYears(startDate, 10)
  const maxOccurrences = occurrences || 365

  while (current < limit && count < maxOccurrences) {
    let next: Date

    switch (type) {
      case RecurrenceType.DAILY:
        next = addDays(current, 1)
        break
      case RecurrenceType.WEEKLY:
        next = addDays(current, 7)
        break
      case RecurrenceType.BIWEEKLY:
        next = addDays(current, 14)
        break
      case RecurrenceType.MONTHLY:
        next = addMonths(current, 1)
        break
      case RecurrenceType.QUARTERLY:
        next = addMonths(current, 3)
        break
      case RecurrenceType.YEARLY:
        next = addYears(current, 1)
        break
      default:
        return dates
    }

    if (next <= limit) {
      dates.push(new Date(next))
      current = next
      count++
    } else {
      break
    }
  }

  return dates
}

/**
 * ============================================================================
 * UTILIDADES VARIAS
 * ============================================================================
 */

/**
 * Obtener nombres de los días de la semana
 */
export function getDayNames(locale: string = 'es-ES'): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'long' })
  const days = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(2024, 0, i + 1)
    days.push(formatter.format(date))
  }

  return days
}

/**
 * Obtener nombres abreviados de los días
 */
export function getDayNamesShort(locale: string = 'es-ES'): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  const days = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(2024, 0, i + 1)
    days.push(formatter.format(date))
  }

  return days
}

/**
 * Obtener nombres de los meses
 */
export function getMonthNames(locale: string = 'es-ES'): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'long' })
  const months = []

  for (let i = 0; i < 12; i++) {
    const date = new Date(2024, i, 1)
    months.push(formatter.format(date))
  }

  return months
}

/**
 * Obtener números de días en un mes
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Obtener número de semana del año
 */
export function getWeekOfYear(date: Date): number {
  const start = getYearStart(date.getFullYear())
  return Math.floor((getDaysBetween(start, date) + start.getDay()) / 7) + 1
}

/**
 * Obtener número del día de la semana (0-6)
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay()
}

/**
 * Obtener nombre del día
 */
export function getDayName(date: Date, locale: string = 'es-ES'): string {
  return date.toLocaleDateString(locale, { weekday: 'long' })
}

/**
 * Obtener nombre del mes
 */
export function getMonthName(date: Date, locale: string = 'es-ES'): string {
  return date.toLocaleDateString(locale, { month: 'long' })
}

/**
 * Redondear a la próxima hora
 */
export function roundToNextHour(date: Date): Date {
  const result = new Date(date)
  result.setHours(result.getHours() + 1, 0, 0, 0)
  return result
}

/**
 * Redondear a la próxima media hora
 */
export function roundToNextHalfHour(date: Date): Date {
  const result = new Date(date)
  const minutes = result.getMinutes()

  if (minutes < 30) {
    result.setMinutes(30, 0, 0)
  } else {
    result.setHours(result.getHours() + 1)
    result.setMinutes(0, 0, 0)
  }

  return result
}

/**
 * Redondear a la próxima cuarto de hora
 */
export function roundToNextQuarterHour(date: Date): Date {
  const result = new Date(date)
  const minutes = result.getMinutes()
  const nextQuarter = Math.ceil(minutes / 15) * 15

  if (nextQuarter === 60) {
    result.setHours(result.getHours() + 1, 0, 0, 0)
  } else {
    result.setMinutes(nextQuarter, 0, 0)
  }

  return result
}

/**
 * Crear rango de fechas
 */
export function createDateRange(from: Date | string, to: Date | string): DateRange {
  return {
    from: from instanceof Date ? from : new Date(from),
    to: to instanceof Date ? to : new Date(to)
  }
}

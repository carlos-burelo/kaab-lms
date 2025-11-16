/**
 * Calendar API - API extensa y completa para operaciones de calendario
 * Proporciona métodos para CRUD, filtrado, búsqueda, análisis y más
 */

import {
  type AvailabilitySlot,
  type BusyTime,
  type CalendarEventBase,
  type CalendarEventInput,
  type CalendarExportOptions,
  type CalendarFilterOptions,
  type CalendarListResponse,
  type CalendarResponse,
  type CalendarSearchQuery,
  type CalendarStats,
  type DateRange,
  type EventPriority,
  type EventStatistics,
  EventStatus,
  type EventType,
  type RecurrenceType,
  type ReminderType,
  type SyncResult,
  type TimeConflict
} from './calendar-types'

/**
 * Clase principal de la API de Calendario
 * Centraliza todas las operaciones relacionadas con el calendario
 */
export class CalendarAPI {
  private baseUrl: string = '/api/calendar'
  private cache: Map<string, any> = new Map()
  private cacheExpiry: Map<string, number> = new Map()

  /**
   * ============================================================================
   * CRUD BÁSICO
   * ============================================================================
   */

  /**
   * Crear un nuevo evento
   */
  async createEvent(userId: string, data: CalendarEventInput): Promise<CalendarResponse<CalendarEventBase>> {
    const response = await fetch(`${this.baseUrl}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data })
    })
    return response.json()
  }

  /**
   * Obtener evento por ID
   */
  async getEvent(eventId: string): Promise<CalendarResponse<CalendarEventBase>> {
    const cached = this.getCache(`event_${eventId}`)
    if (cached) return cached

    const response = await fetch(`${this.baseUrl}/events/${eventId}`)
    const data = await response.json()

    this.setCache(`event_${eventId}`, data, 5 * 60 * 1000) // 5 min cache
    return data
  }

  /**
   * Actualizar evento
   */
  async updateEvent(eventId: string, data: Partial<CalendarEventInput>): Promise<CalendarResponse<CalendarEventBase>> {
    this.invalidateCache(`event_${eventId}`)

    const response = await fetch(`${this.baseUrl}/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  /**
   * Eliminar evento
   */
  async deleteEvent(eventId: string): Promise<CalendarResponse<void>> {
    this.invalidateCache(`event_${eventId}`)

    const response = await fetch(`${this.baseUrl}/events/${eventId}`, {
      method: 'DELETE'
    })
    return response.json()
  }

  /**
   * Eliminar múltiples eventos
   */
  async deleteEvents(eventIds: string[]): Promise<CalendarResponse<{ deleted: number }>> {
    eventIds.forEach((id) => {
      this.invalidateCache(`event_${id}`)
    })

    const response = await fetch(`${this.baseUrl}/events/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventIds })
    })
    return response.json()
  }

  /**
   * ============================================================================
   * OBTENCIÓN DE EVENTOS
   * ============================================================================
   */

  /**
   * Obtener eventos del usuario con filtros
   */
  async getUserEvents(userId: string, filters?: CalendarFilterOptions): Promise<CalendarListResponse<CalendarEventBase>> {
    const params = new URLSearchParams()
    params.append('userId', userId)

    if (filters) {
      if (filters.fromDate) params.append('fromDate', new Date(filters.fromDate).toISOString())
      if (filters.toDate) params.append('toDate', new Date(filters.toDate).toISOString())
      if (filters.types) params.append('types', filters.types.join(','))
      if (filters.status) params.append('status', filters.status.join(','))
      if (filters.priority) params.append('priority', filters.priority.join(','))
      if (filters.search) params.append('search', filters.search)
      if (filters.location) params.append('location', filters.location)
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.offset) params.append('offset', filters.offset.toString())
    }

    const response = await fetch(`${this.baseUrl}/events?${params}`)
    return response.json()
  }

  /**
   * Obtener eventos por tipo
   */
  async getEventsByType(userId: string, type: EventType): Promise<CalendarListResponse<CalendarEventBase>> {
    return this.getUserEvents(userId, { types: [type] })
  }

  /**
   * Obtener eventos por rango de fechas
   */
  async getEventsByDateRange(userId: string, range: DateRange): Promise<CalendarListResponse<CalendarEventBase>> {
    return this.getUserEvents(userId, {
      fromDate: range.from,
      toDate: range.to
    })
  }

  /**
   * Obtener eventos próximos
   */
  async getUpcomingEvents(userId: string, daysAhead: number = 7): Promise<CalendarListResponse<CalendarEventBase>> {
    const now = new Date()
    const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)

    return this.getEventsByDateRange(userId, { from: now, to: future })
  }

  /**
   * Obtener eventos vencidos
   */
  async getOverdueEvents(userId: string): Promise<CalendarListResponse<CalendarEventBase>> {
    const now = new Date()
    const pastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

    return this.getUserEvents(userId, {
      fromDate: pastYear,
      toDate: now,
      status: [EventStatus.SCHEDULED, EventStatus.DRAFT]
    })
  }

  /**
   * Obtener eventos de hoy
   */
  async getTodayEvents(userId: string): Promise<CalendarListResponse<CalendarEventBase>> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return this.getEventsByDateRange(userId, { from: today, to: tomorrow })
  }

  /**
   * Obtener eventos de esta semana
   */
  async getWeekEvents(userId: string, startDate?: Date): Promise<CalendarListResponse<CalendarEventBase>> {
    const start = startDate ? new Date(startDate) : this.getWeekStart(new Date())
    const end = new Date(start)
    end.setDate(end.getDate() + 7)

    return this.getEventsByDateRange(userId, { from: start, to: end })
  }

  /**
   * Obtener eventos de este mes
   */
  async getMonthEvents(userId: string, year?: number, month?: number): Promise<CalendarListResponse<CalendarEventBase>> {
    const now = new Date()
    const y = year || now.getFullYear()
    const m = month !== undefined ? month : now.getMonth()

    const start = new Date(y, m, 1)
    const end = new Date(y, m + 1, 0)
    end.setHours(23, 59, 59, 999)

    return this.getEventsByDateRange(userId, { from: start, to: end })
  }

  /**
   * Obtener eventos de este año
   */
  async getYearEvents(userId: string, year?: number): Promise<CalendarListResponse<CalendarEventBase>> {
    const now = new Date()
    const y = year || now.getFullYear()

    const start = new Date(y, 0, 1)
    const end = new Date(y, 11, 31, 23, 59, 59, 999)

    return this.getEventsByDateRange(userId, { from: start, to: end })
  }

  /**
   * ============================================================================
   * BÚSQUEDA Y FILTRADO AVANZADO
   * ============================================================================
   */

  /**
   * Buscar eventos
   */
  async searchEvents(userId: string, query: CalendarSearchQuery): Promise<CalendarListResponse<CalendarEventBase>> {
    const params = new URLSearchParams()
    params.append('userId', userId)
    params.append('query', query.query)

    if (query.fields) params.append('fields', query.fields.join(','))
    if (query.fuzzy !== undefined) params.append('fuzzy', query.fuzzy.toString())
    if (query.limit) params.append('limit', query.limit.toString())

    const response = await fetch(`${this.baseUrl}/search?${params}`)
    return response.json()
  }

  /**
   * Filtrar eventos avanzado
   */
  async filterEvents(userId: string, filters: CalendarFilterOptions): Promise<CalendarListResponse<CalendarEventBase>> {
    return this.getUserEvents(userId, filters)
  }

  /**
   * Obtener eventos por etiqueta
   */
  async getEventsByTag(userId: string, tag: string): Promise<CalendarListResponse<CalendarEventBase>> {
    return this.getUserEvents(userId, { tags: [tag] })
  }

  /**
   * Obtener eventos por ubicación
   */
  async getEventsByLocation(userId: string, location: string): Promise<CalendarListResponse<CalendarEventBase>> {
    return this.getUserEvents(userId, { location })
  }

  /**
   * Obtener eventos por prioridad
   */
  async getEventsByPriority(userId: string, priority: EventPriority): Promise<CalendarListResponse<CalendarEventBase>> {
    return this.getUserEvents(userId, { priority: [priority] })
  }

  /**
   * ============================================================================
   * ANÁLISIS Y ESTADÍSTICAS
   * ============================================================================
   */

  /**
   * Obtener estadísticas del calendario
   */
  async getCalendarStats(userId: string, dateRange?: DateRange): Promise<CalendarResponse<CalendarStats>> {
    const params = new URLSearchParams()
    params.append('userId', userId)

    if (dateRange) {
      params.append('fromDate', dateRange.from.toISOString())
      params.append('toDate', dateRange.to.toISOString())
    }

    const response = await fetch(`${this.baseUrl}/stats?${params}`)
    return response.json()
  }

  /**
   * Obtener estadísticas de eventos
   */
  async getEventStats(userId: string): Promise<CalendarResponse<EventStatistics>> {
    const response = await fetch(`${this.baseUrl}/stats/events?userId=${userId}`)
    return response.json()
  }

  /**
   * Obtener día más ocupado
   */
  async getBusiestDay(userId: string, dateRange?: DateRange): Promise<CalendarResponse<{ date: Date; count: number }>> {
    const params = new URLSearchParams()
    params.append('userId', userId)

    if (dateRange) {
      params.append('fromDate', dateRange.from.toISOString())
      params.append('toDate', dateRange.to.toISOString())
    }

    const response = await fetch(`${this.baseUrl}/stats/busiest-day?${params}`)
    return response.json()
  }

  /**
   * Obtener patrones de uso
   */
  async getUsagePatterns(userId: string): Promise<CalendarResponse<Record<string, number>>> {
    const response = await fetch(`${this.baseUrl}/stats/patterns?userId=${userId}`)
    return response.json()
  }

  /**
   * ============================================================================
   * DETECCIÓN DE CONFLICTOS Y DISPONIBILIDAD
   * ============================================================================
   */

  /**
   * Detectar conflictos de tiempo
   */
  async detectConflicts(userId: string, eventId?: string): Promise<CalendarResponse<TimeConflict[]>> {
    const params = new URLSearchParams()
    params.append('userId', userId)

    if (eventId) params.append('eventId', eventId)

    const response = await fetch(`${this.baseUrl}/conflicts?${params}`)
    return response.json()
  }

  /**
   * Encontrar ranuras de tiempo disponibles
   */
  async findAvailableSlots(
    userId: string,
    dateRange: DateRange,
    durationMinutes: number = 60
  ): Promise<CalendarResponse<AvailabilitySlot[]>> {
    const params = new URLSearchParams()
    params.append('userId', userId)
    params.append('fromDate', dateRange.from.toISOString())
    params.append('toDate', dateRange.to.toISOString())
    params.append('duration', durationMinutes.toString())

    const response = await fetch(`${this.baseUrl}/availability?${params}`)
    return response.json()
  }

  /**
   * Obtener tiempo ocupado
   */
  async getBusyTime(userId: string, dateRange: DateRange): Promise<CalendarResponse<BusyTime[]>> {
    const params = new URLSearchParams()
    params.append('userId', userId)
    params.append('fromDate', dateRange.from.toISOString())
    params.append('toDate', dateRange.to.toISOString())

    const response = await fetch(`${this.baseUrl}/busy-time?${params}`)
    return response.json()
  }

  /**
   * Verificar disponibilidad en un rango de fechas
   */
  async checkAvailability(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarResponse<{ isAvailable: boolean; conflicts: TimeConflict[] }>> {
    const params = new URLSearchParams()
    params.append('userId', userId)
    params.append('startDate', startDate.toISOString())
    params.append('endDate', endDate.toISOString())

    const response = await fetch(`${this.baseUrl}/check-availability?${params}`)
    return response.json()
  }

  /**
   * ============================================================================
   * RECURRENCIA Y REPETICIÓN
   * ============================================================================
   */

  /**
   * Crear evento recurrente
   */
  async createRecurringEvent(
    userId: string,
    data: CalendarEventInput & { recurrence: { type: RecurrenceType; endDate?: Date } }
  ): Promise<CalendarResponse<CalendarEventBase[]>> {
    const response = await fetch(`${this.baseUrl}/events/recurring`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data })
    })
    return response.json()
  }

  /**
   * Actualizar evento recurrente
   */
  async updateRecurringEvent(
    eventId: string,
    data: Partial<CalendarEventInput>,
    updateMode: 'THIS' | 'THIS_AND_FUTURE' | 'ALL' = 'THIS'
  ): Promise<CalendarResponse<CalendarEventBase[]>> {
    const response = await fetch(`${this.baseUrl}/events/recurring/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, updateMode })
    })
    return response.json()
  }

  /**
   * Obtener ocurrencias de evento recurrente
   */
  async getRecurringEventOccurrences(eventId: string, dateRange: DateRange): Promise<CalendarListResponse<CalendarEventBase>> {
    const params = new URLSearchParams()
    params.append('fromDate', dateRange.from.toISOString())
    params.append('toDate', dateRange.to.toISOString())

    const response = await fetch(`${this.baseUrl}/events/${eventId}/occurrences?${params}`)
    return response.json()
  }

  /**
   * ============================================================================
   * RECORDATORIOS Y NOTIFICACIONES
   * ============================================================================
   */

  /**
   * Agregar recordatorio a evento
   */
  async addReminder(eventId: string, reminderType: ReminderType): Promise<CalendarResponse<CalendarEventBase>> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: reminderType })
    })
    return response.json()
  }

  /**
   * Eliminar recordatorio
   */
  async removeReminder(eventId: string, reminderId: string): Promise<CalendarResponse<CalendarEventBase>> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}/reminders/${reminderId}`, {
      method: 'DELETE'
    })
    return response.json()
  }

  /**
   * Actualizar recordatorio
   */
  async updateReminder(
    eventId: string,
    reminderId: string,
    reminderType: ReminderType
  ): Promise<CalendarResponse<CalendarEventBase>> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}/reminders/${reminderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: reminderType })
    })
    return response.json()
  }

  /**
   * Obtener próximos recordatorios
   */
  async getUpcomingReminders(userId: string, minutesAhead: number = 60): Promise<CalendarListResponse<CalendarEventBase>> {
    const params = new URLSearchParams()
    params.append('userId', userId)
    params.append('minutesAhead', minutesAhead.toString())

    const response = await fetch(`${this.baseUrl}/reminders?${params}`)
    return response.json()
  }

  /**
   * ============================================================================
   * ESTADO Y CICLO DE VIDA DEL EVENTO
   * ============================================================================
   */

  /**
   * Cambiar estado del evento
   */
  async updateEventStatus(eventId: string, status: EventStatus): Promise<CalendarResponse<CalendarEventBase>> {
    return this.updateEvent(eventId, { status })
  }

  /**
   * Marcar evento como completado
   */
  async completeEvent(eventId: string): Promise<CalendarResponse<CalendarEventBase>> {
    return this.updateEventStatus(eventId, EventStatus.COMPLETED)
  }

  /**
   * Archivar evento
   */
  async archiveEvent(eventId: string): Promise<CalendarResponse<void>> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}/archive`, {
      method: 'POST'
    })
    return response.json()
  }

  /**
   * Restaurar evento archivado
   */
  async restoreEvent(eventId: string): Promise<CalendarResponse<CalendarEventBase>> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}/restore`, {
      method: 'POST'
    })
    return response.json()
  }

  /**
   * Cancelar evento
   */
  async cancelEvent(eventId: string, _reason?: string): Promise<CalendarResponse<CalendarEventBase>> {
    return this.updateEventStatus(eventId, EventStatus.CANCELLED)
  }

  /**
   * ============================================================================
   * ASISTENTES Y COLABORACIÓN
   * ============================================================================
   */

  /**
   * Agregar asistente a evento
   */
  async addAttendee(eventId: string, email: string, name?: string): Promise<CalendarResponse<CalendarEventBase>> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}/attendees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    })
    return response.json()
  }

  /**
   * Eliminar asistente
   */
  async removeAttendee(eventId: string, email: string): Promise<CalendarResponse<CalendarEventBase>> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}/attendees/${email}`, {
      method: 'DELETE'
    })
    return response.json()
  }

  /**
   * Actualizar RSVP del asistente
   */
  async updateAttendeeRsvp(
    eventId: string,
    email: string,
    status: 'ACCEPTED' | 'DECLINED' | 'TENTATIVE'
  ): Promise<CalendarResponse<CalendarEventBase>> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}/attendees/${email}/rsvp`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    return response.json()
  }

  /**
   * ============================================================================
   * ETIQUETAS Y CATEGORIZACIÓN
   * ============================================================================
   */

  /**
   * Agregar etiqueta a evento
   */
  async addTag(eventId: string, tag: string): Promise<CalendarResponse<CalendarEventBase>> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag })
    })
    return response.json()
  }

  /**
   * Eliminar etiqueta
   */
  async removeTag(eventId: string, tag: string): Promise<CalendarResponse<CalendarEventBase>> {
    const response = await fetch(`${this.baseUrl}/events/${eventId}/tags/${tag}`, {
      method: 'DELETE'
    })
    return response.json()
  }

  /**
   * Obtener todas las etiquetas
   */
  async getAllTags(userId: string): Promise<CalendarResponse<string[]>> {
    const response = await fetch(`${this.baseUrl}/tags?userId=${userId}`)
    return response.json()
  }

  /**
   * ============================================================================
   * EXPORTACIÓN E IMPORTACIÓN
   * ============================================================================
   */

  /**
   * Exportar calendario
   */
  async exportCalendar(
    userId: string,
    options: CalendarExportOptions
  ): Promise<CalendarResponse<{ url: string; filename: string }>> {
    const params = new URLSearchParams()
    params.append('userId', userId)
    params.append('format', options.format)

    if (options.includeAttendees !== undefined) params.append('includeAttendees', options.includeAttendees.toString())
    if (options.includeAttachments !== undefined) params.append('includeAttachments', options.includeAttachments.toString())
    if (options.dateRange) {
      params.append('fromDate', options.dateRange.from.toISOString())
      params.append('toDate', options.dateRange.to.toISOString())
    }
    if (options.types) params.append('types', options.types.join(','))

    const response = await fetch(`${this.baseUrl}/export?${params}`)
    return response.json()
  }

  /**
   * Importar eventos desde ICS
   */
  async importFromIcs(userId: string, icsContent: string): Promise<CalendarResponse<{ imported: number; failed: number }>> {
    const response = await fetch(`${this.baseUrl}/import/ics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, icsContent })
    })
    return response.json()
  }

  /**
   * Sincronizar con calendario externo
   */
  async syncWithExternal(userId: string, source: string): Promise<CalendarResponse<SyncResult>> {
    const response = await fetch(`${this.baseUrl}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, source })
    })
    return response.json()
  }

  /**
   * ============================================================================
   * CONFIGURACIÓN DE CALENDARIO Y BLOQUES DE TIEMPO
   * ============================================================================
   */

  /**
   * Obtener configuración del calendario del usuario
   */
  async getUserConfig(userId: string): Promise<CalendarResponse<any>> {
    const cached = this.getCache(`config_${userId}`)
    if (cached) return cached

    const response = await fetch(`${this.baseUrl}/config/${userId}`)
    const data = await response.json()

    this.setCache(`config_${userId}`, data, 10 * 60 * 1000) // 10 min cache
    return data
  }

  /**
   * Actualizar configuración del usuario
   */
  async updateUserConfig(userId: string, config: any): Promise<CalendarResponse<any>> {
    this.invalidateCache(`config_${userId}`)

    const response = await fetch(`${this.baseUrl}/config/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    return response.json()
  }

  /**
   * Crear bloque de tiempo (vacaciones, pausa, etc)
   */
  async createBlockedTime(userId: string, blockedTime: any): Promise<CalendarResponse<any>> {
    const response = await fetch(`${this.baseUrl}/blocked-times`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...blockedTime })
    })
    return response.json()
  }

  /**
   * Obtener bloques de tiempo
   */
  async getBlockedTimes(userId: string): Promise<CalendarListResponse<any>> {
    const cached = this.getCache(`blocked_${userId}`)
    if (cached) return cached

    const response = await fetch(`${this.baseUrl}/blocked-times?userId=${userId}`)
    const data = await response.json()

    this.setCache(`blocked_${userId}`, data, 5 * 60 * 1000)
    return data
  }

  /**
   * Actualizar bloque de tiempo
   */
  async updateBlockedTime(blockedTimeId: string, data: any): Promise<CalendarResponse<any>> {
    this.invalidateCache('blocked_')

    const response = await fetch(`${this.baseUrl}/blocked-times/${blockedTimeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  /**
   * Eliminar bloque de tiempo
   */
  async deleteBlockedTime(blockedTimeId: string): Promise<CalendarResponse<void>> {
    this.invalidateCache('blocked_')

    const response = await fetch(`${this.baseUrl}/blocked-times/${blockedTimeId}`, {
      method: 'DELETE'
    })
    return response.json()
  }

  /**
   * Configurar horas visibles en vista de día
   */
  async setVisibleHours(
    userId: string,
    startHour: number,
    endHour: number,
    daysOfWeek?: number[]
  ): Promise<CalendarResponse<any>> {
    this.invalidateCache(`config_${userId}`)

    const response = await fetch(`${this.baseUrl}/config/${userId}/visible-hours`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startHour, endHour, daysOfWeek })
    })
    return response.json()
  }

  /**
   * Obtener horas visibles configuradas
   */
  async getVisibleHours(userId: string): Promise<CalendarResponse<any>> {
    const response = await fetch(`${this.baseUrl}/config/${userId}/visible-hours`)
    return response.json()
  }

  /**
   * Configurar horarios de trabajo
   */
  async setWorkingHours(userId: string, workingHours: any): Promise<CalendarResponse<any>> {
    this.invalidateCache(`config_${userId}`)

    const response = await fetch(`${this.baseUrl}/config/${userId}/working-hours`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workingHours)
    })
    return response.json()
  }

  /**
   * Obtener horarios de trabajo
   */
  async getWorkingHours(userId: string): Promise<CalendarResponse<any>> {
    const response = await fetch(`${this.baseUrl}/config/${userId}/working-hours`)
    return response.json()
  }

  /**
   * Añadir día festivo/vacaciones
   */
  async addHoliday(userId: string, holiday: any): Promise<CalendarResponse<any>> {
    this.invalidateCache(`blocked_${userId}`)

    const response = await fetch(`${this.baseUrl}/holidays`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...holiday })
    })
    return response.json()
  }

  /**
   * Obtener días festivos
   */
  async getHolidays(userId: string, year?: number): Promise<CalendarListResponse<any>> {
    let url = `${this.baseUrl}/holidays?userId=${userId}`
    if (year) url += `&year=${year}`

    const response = await fetch(url)
    return response.json()
  }

  /**
   * Obtener disponibilidad (slots libres) en un rango
   */
  async getAvailability(
    userId: string,
    fromDate: Date,
    toDate: Date,
    durationMinutes: number = 60
  ): Promise<CalendarListResponse<any>> {
    const params = new URLSearchParams()
    params.append('userId', userId)
    params.append('fromDate', fromDate.toISOString())
    params.append('toDate', toDate.toISOString())
    params.append('durationMinutes', durationMinutes.toString())

    const response = await fetch(`${this.baseUrl}/availability?${params}`)
    return response.json()
  }

  /**
   * Verificar si un slot está disponible
   */
  async checkSlotAvailability(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<
    CalendarResponse<{
      available: boolean
    }>
  > {
    const params = new URLSearchParams()
    params.append('userId', userId)
    params.append('startDate', startDate.toISOString())
    params.append('endDate', endDate.toISOString())

    const response = await fetch(`${this.baseUrl}/availability/check?${params}`)
    return response.json()
  }

  /**
   * ============================================================================
   * UTILIDADES INTERNAS
   * ============================================================================
   */

  /**
   * Obtener inicio de semana
   */
  private getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  /**
   * Cache - Obtener
   */
  private getCache(key: string): any {
    const expiry = this.cacheExpiry.get(key)

    if (expiry && expiry < Date.now()) {
      this.cache.delete(key)
      this.cacheExpiry.delete(key)
      return null
    }

    return this.cache.get(key)
  }

  /**
   * Cache - Establecer
   */
  private setCache(key: string, value: any, ttl: number): void {
    this.cache.set(key, value)
    this.cacheExpiry.set(key, Date.now() + ttl)
  }

  /**
   * Cache - Invalidar
   */
  private invalidateCache(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
        this.cacheExpiry.delete(key)
      }
    }
  }

  /**
   * Limpiar todo el cache
   */
  clearCache(): void {
    this.cache.clear()
    this.cacheExpiry.clear()
  }
}

// Instancia global
export const calendarAPI = new CalendarAPI()

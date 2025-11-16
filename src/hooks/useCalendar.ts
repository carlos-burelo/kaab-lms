'use client'

import { useCallback, useEffect, useReducer, useState } from 'react'
import { calendarAPI } from '@/lib/calendar/calendar-api'
import {
  type CalendarEventBase,
  type CalendarEventInput,
  type CalendarFilterOptions,
  type CalendarState,
  CalendarView,
  type EventType,
  type ReminderType
} from '@/lib/calendar/calendar-types'
import {
  addDays,
  addMonths,
  getDayEnd,
  getDayStart,
  getMonthEnd,
  getMonthStart,
  getWeekEnd,
  getWeekStart,
  getYearEnd,
  getYearStart,
  isSameDay,
  isToday
} from '@/lib/calendar/date-utils'

/**
 * Hook principal del calendario
 * Proporciona estado y métodos para interactuar con el calendario
 */
export function useCalendar(userId: string, initialView: CalendarView = CalendarView.MONTH) {
  const [state, dispatch] = useReducer(calendarReducer, {
    currentView: initialView,
    currentDate: new Date(),
    selectedEvents: [],
    isLoading: false
  })

  const [events, setEvents] = useState<CalendarEventBase[]>([])
  const [error, setError] = useState<string | null>(null)

  /**
   * Cargar eventos basado en la vista actual y fecha
   */
  const loadEvents = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      let dateRange: any

      switch (state.currentView) {
        case CalendarView.DAY:
          dateRange = {
            from: getDayStart(state.currentDate),
            to: getDayEnd(state.currentDate)
          }
          break
        case CalendarView.WEEK:
          dateRange = {
            from: getWeekStart(state.currentDate),
            to: getWeekEnd(state.currentDate)
          }
          break
        case CalendarView.YEAR:
          dateRange = {
            from: getYearStart(state.currentDate.getFullYear()),
            to: getYearEnd(state.currentDate.getFullYear())
          }
          break
        default:
          dateRange = {
            from: getMonthStart(state.currentDate),
            to: getMonthEnd(state.currentDate)
          }
      }

      const result = await calendarAPI.getEventsByDateRange(userId, dateRange)

      if (result.success) {
        setEvents(result.data || [])
        setError(null)
      } else {
        setError(result.error || 'Error loading events')
      }
    } catch (_err) {
      setError('Error loading events')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [userId, state.currentView, state.currentDate])

  /**
   * Cargar eventos al cambiar vista o fecha
   */
  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  /**
   * ============================================================================
   * OPERACIONES CRUD
   * ============================================================================
   */

  const createEvent = useCallback(
    async (data: CalendarEventInput) => {
      try {
        const result = await calendarAPI.createEvent(userId, data)

        if (result.success && result.data) {
          setEvents((prev) => [...prev, result.data!])
          return result.data
        }

        throw new Error(result.error || 'Failed to create event')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error creating event')
        throw err
      }
    },
    [userId]
  )

  const updateEvent = useCallback(async (eventId: string, data: Partial<CalendarEventInput>) => {
    try {
      const result = await calendarAPI.updateEvent(eventId, data)

      if (result.success && result.data) {
        setEvents((prev) => prev.map((e) => (e.id === eventId ? result.data! : e)))
        return result.data
      }

      throw new Error(result.error || 'Failed to update event')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating event')
      throw err
    }
  }, [])

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      const result = await calendarAPI.deleteEvent(eventId)

      if (result.success) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId))
      } else {
        throw new Error(result.error || 'Failed to delete event')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting event')
      throw err
    }
  }, [])

  /**
   * ============================================================================
   * NAVEGACIÓN
   * ============================================================================
   */

  const nextPeriod = useCallback(() => {
    dispatch({
      type: 'SET_DATE',
      payload:
        state.currentView === CalendarView.YEAR
          ? addDays(state.currentDate, 365)
          : state.currentView === CalendarView.MONTH
            ? addMonths(state.currentDate, 1)
            : addDays(state.currentDate, state.currentView === CalendarView.WEEK ? 7 : 1)
    })
  }, [state.currentView, state.currentDate])

  const previousPeriod = useCallback(() => {
    dispatch({
      type: 'SET_DATE',
      payload:
        state.currentView === CalendarView.YEAR
          ? addDays(state.currentDate, -365)
          : state.currentView === CalendarView.MONTH
            ? addMonths(state.currentDate, -1)
            : addDays(state.currentDate, state.currentView === CalendarView.WEEK ? -7 : -1)
    })
  }, [state.currentView, state.currentDate])

  const goToToday = useCallback(() => {
    dispatch({ type: 'SET_DATE', payload: new Date() })
  }, [])

  const goToDate = useCallback((date: Date | string) => {
    dispatch({
      type: 'SET_DATE',
      payload: date instanceof Date ? date : new Date(date)
    })
  }, [])

  /**
   * ============================================================================
   * FILTRADO Y BÚSQUEDA
   * ============================================================================
   */

  const filterEvents = useCallback(
    async (filters: CalendarFilterOptions) => {
      dispatch({ type: 'SET_LOADING', payload: true })

      try {
        const result = await calendarAPI.filterEvents(userId, filters)

        if (result.success) {
          setEvents(result.data || [])
          setError(null)
        } else {
          setError(result.error || 'Error filtering events')
        }
      } catch (_err) {
        setError('Error filtering events')
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    [userId]
  )

  const searchEvents = useCallback(
    async (query: string) => {
      dispatch({ type: 'SET_LOADING', payload: true })

      try {
        const result = await calendarAPI.searchEvents(userId, { query })

        if (result.success) {
          setEvents(result.data || [])
          setError(null)
        } else {
          setError(result.error || 'Error searching events')
        }
      } catch (_err) {
        setError('Error searching events')
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    [userId]
  )

  /**
   * ============================================================================
   * VISTA
   * ============================================================================
   */

  const setView = useCallback((view: CalendarView) => {
    dispatch({ type: 'SET_VIEW', payload: view })
  }, [])

  const selectDate = useCallback((date: Date) => {
    dispatch({ type: 'SELECT_DATE', payload: date })
  }, [])

  const selectEvent = useCallback((eventId: string) => {
    dispatch({ type: 'SELECT_EVENT', payload: eventId })
  }, [])

  const deselectEvent = useCallback((eventId: string) => {
    dispatch({ type: 'DESELECT_EVENT', payload: eventId })
  }, [])

  /**
   * ============================================================================
   * UTILIDADES
   * ============================================================================
   */

  const getEventsForDate = useCallback(
    (date: Date): CalendarEventBase[] => {
      return events.filter(
        (event) =>
          isSameDay(new Date(event.startDate), date) || (new Date(event.startDate) <= date && date <= new Date(event.endDate))
      )
    },
    [events]
  )

  const getEventsForType = useCallback(
    (type: EventType): CalendarEventBase[] => {
      return events.filter((e) => e.type === type)
    },
    [events]
  )

  const hasTodayEvents = useCallback((): boolean => {
    return events.some((e) => isToday(new Date(e.startDate)))
  }, [events])

  const getSelectedEventDetails = useCallback((): CalendarEventBase[] => {
    return events.filter((e) => state.selectedEvents?.includes(e.id))
  }, [events, state.selectedEvents])

  return {
    // Estado
    state,
    events,
    isLoading: state.isLoading,
    error,
    currentView: state.currentView,
    currentDate: state.currentDate,
    selectedDate: state.selectedDate,
    selectedEventIds: state.selectedEvents,

    // CRUD
    createEvent,
    updateEvent,
    deleteEvent,

    // Navegación
    nextPeriod,
    previousPeriod,
    goToToday,
    goToDate,
    setView,

    // Filtrado
    filterEvents,
    searchEvents,

    // Selección
    selectDate,
    selectEvent,
    deselectEvent,

    // Utilidades
    getEventsForDate,
    getEventsForType,
    hasTodayEvents,
    getSelectedEventDetails,
    refreshEvents: loadEvents
  }
}

/**
 * Reducer para manejar el estado del calendario
 */
function calendarReducer(state: CalendarState, action: any): CalendarState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload }

    case 'SET_DATE':
      return { ...state, currentDate: action.payload }

    case 'SELECT_DATE':
      return { ...state, selectedDate: action.payload }

    case 'SELECT_EVENT':
      return {
        ...state,
        selectedEvents: [...(state.selectedEvents || []), action.payload]
      }

    case 'DESELECT_EVENT':
      return {
        ...state,
        selectedEvents: (state.selectedEvents || []).filter((id) => id !== action.payload)
      }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    case 'SET_FILTERS':
      return { ...state, filters: action.payload }

    default:
      return state
  }
}

/**
 * Hook para interactuar con recordatorios
 */
export function useCalendarReminders(eventId: string) {
  const [reminders, setReminders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addReminder = useCallback(
    async (type: ReminderType) => {
      setIsLoading(true)

      try {
        const result = await calendarAPI.addReminder(eventId, type)

        if (result.success && result.data) {
          setReminders(result.data.reminders || [])
        }
      } catch (err) {
        console.error('Error adding reminder:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [eventId]
  )

  const removeReminder = useCallback(
    async (reminderId: string) => {
      setIsLoading(true)

      try {
        const result = await calendarAPI.removeReminder(eventId, reminderId)

        if (result.success && result.data) {
          setReminders(result.data.reminders || [])
        }
      } catch (err) {
        console.error('Error removing reminder:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [eventId]
  )

  return { reminders, isLoading, addReminder, removeReminder }
}

/**
 * Hook para conflictos y disponibilidad
 */
export function useCalendarAvailability(userId: string) {
  const [availability, setAvailability] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkConflicts = useCallback(
    async (eventId?: string) => {
      setIsLoading(true)

      try {
        const result = await calendarAPI.detectConflicts(userId, eventId)

        if (result.success) {
          setAvailability(result.data)
        }
      } catch (err) {
        console.error('Error checking conflicts:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [userId]
  )

  return { availability, isLoading, checkConflicts }
}

/**
 * Hook para estadísticas
 */
export function useCalendarStats(userId: string) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadStats = useCallback(async () => {
    setIsLoading(true)

    try {
      const result = await calendarAPI.getCalendarStats(userId)

      if (result.success) {
        setStats(result.data)
      }
    } catch (err) {
      console.error('Error loading stats:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  return { stats, isLoading, refresh: loadStats }
}

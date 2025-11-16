'use client'

import { useCallback, useEffect, useState } from 'react'
import { calendarAPI } from '@/lib/calendar/calendar-api'
import type { BlockedTime, CalendarUserConfig, VisibleHoursRange } from '@/lib/calendar/calendar-types'

/**
 * Hook para gestionar la configuración del calendario del usuario
 * Proporciona métodos para configurar bloques de tiempo, horas visibles, etc
 */
export function useCalendarConfig(userId: string) {
  const [config, setConfig] = useState<CalendarUserConfig | null>(null)
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([])
  const [visibleHours, setVisibleHours] = useState<VisibleHoursRange | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Cargar configuración del usuario
   */
  const loadConfig = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await calendarAPI.getUserConfig(userId)
      if (result.success && result.data) {
        setConfig(result.data)
      } else {
        setError(result.error || 'Error al cargar configuración')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  /**
   * Cargar bloques de tiempo
   */
  const loadBlockedTimes = useCallback(async () => {
    try {
      const result = await calendarAPI.getBlockedTimes(userId)
      if (result.success) {
        setBlockedTimes(result.data || [])
      } else {
        setError(result.error || 'Error al cargar bloques de tiempo')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }, [userId])

  /**
   * Cargar horas visibles
   */
  const loadVisibleHours = useCallback(async () => {
    try {
      const result = await calendarAPI.getVisibleHours(userId)
      if (result.success && result.data) {
        setVisibleHours(result.data)
      }
    } catch (err) {
      console.error('Error cargando horas visibles:', err)
    }
  }, [userId])

  /**
   * Cargar todo al montar
   */
  useEffect(() => {
    loadConfig()
    loadBlockedTimes()
    loadVisibleHours()
  }, [loadConfig, loadBlockedTimes, loadVisibleHours])

  /**
   * Actualizar configuración general
   */
  const updateConfig = useCallback(
    async (updates: Partial<CalendarUserConfig>) => {
      setIsLoading(true)
      try {
        const result = await calendarAPI.updateUserConfig(userId, updates)
        if (result.success && result.data) {
          setConfig(result.data)
          return result.data
        }
        throw new Error(result.error || 'Error al actualizar configuración')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [userId]
  )

  /**
   * Configurar horas visibles en vista de día
   */
  const setDayViewHours = useCallback(
    async (startHour: number, endHour: number, daysOfWeek?: number[]) => {
      setIsLoading(true)
      try {
        const result = await calendarAPI.setVisibleHours(userId, startHour, endHour, daysOfWeek)
        if (result.success && result.data) {
          setVisibleHours(result.data)
          return result.data
        }
        throw new Error(result.error || 'Error al configurar horas visibles')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [userId]
  )

  /**
   * Configurar horarios de trabajo
   */
  const setWorkingSchedule = useCallback(
    async (workingHours: any) => {
      setIsLoading(true)
      try {
        const result = await calendarAPI.setWorkingHours(userId, workingHours)
        if (result.success && result.data) {
          return result.data
        }
        throw new Error(result.error || 'Error al configurar horarios de trabajo')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [userId]
  )

  /**
   * Crear bloque de tiempo (vacaciones, pausa, etc)
   */
  const createBlocked = useCallback(
    async (blockedTime: BlockedTime) => {
      setIsLoading(true)
      try {
        const result = await calendarAPI.createBlockedTime(userId, blockedTime)
        if (result.success && result.data) {
          setBlockedTimes((prev) => [...prev, result.data])
          return result.data
        }
        throw new Error(result.error || 'Error al crear bloque de tiempo')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [userId]
  )

  /**
   * Actualizar bloque de tiempo
   */
  const updateBlocked = useCallback(async (blockedTimeId: string, updates: Partial<BlockedTime>) => {
    setIsLoading(true)
    try {
      const result = await calendarAPI.updateBlockedTime(blockedTimeId, updates)
      if (result.success && result.data) {
        setBlockedTimes((prev) => prev.map((bt) => (bt.id === blockedTimeId ? result.data : bt)))
        return result.data
      }
      throw new Error(result.error || 'Error al actualizar bloque de tiempo')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Eliminar bloque de tiempo
   */
  const deleteBlocked = useCallback(async (blockedTimeId: string) => {
    setIsLoading(true)
    try {
      const result = await calendarAPI.deleteBlockedTime(blockedTimeId)
      if (result.success) {
        setBlockedTimes((prev) => prev.filter((bt) => bt.id !== blockedTimeId))
        return true
      }
      throw new Error(result.error || 'Error al eliminar bloque de tiempo')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Añadir día festivo o vacaciones
   */
  const addHoliday = useCallback(
    async (holiday: any) => {
      setIsLoading(true)
      try {
        const result = await calendarAPI.addHoliday(userId, holiday)
        if (result.success && result.data) {
          setBlockedTimes((prev) => [...prev, result.data])
          return result.data
        }
        throw new Error(result.error || 'Error al añadir día festivo')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [userId]
  )

  /**
   * Obtener disponibilidad
   */
  const getAvailability = useCallback(
    async (fromDate: Date, toDate: Date, durationMinutes?: number) => {
      try {
        const result = await calendarAPI.getAvailability(userId, fromDate, toDate, durationMinutes)
        if (result.success) {
          return result.data || []
        }
        throw new Error(result.error || 'Error al obtener disponibilidad')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setError(message)
        throw err
      }
    },
    [userId]
  )

  /**
   * Verificar si un slot está disponible
   */
  const checkAvailability = useCallback(
    async (startDate: Date, endDate: Date) => {
      try {
        const result = await calendarAPI.checkSlotAvailability(userId, startDate, endDate)
        if (result.success && result.data) {
          return result.data.available
        }
        throw new Error(result.error || 'Error al verificar disponibilidad')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido'
        setError(message)
        throw err
      }
    },
    [userId]
  )

  return {
    // Estado
    config,
    blockedTimes,
    visibleHours,
    isLoading,
    error,

    // Métodos de carga
    loadConfig,
    loadBlockedTimes,
    loadVisibleHours,

    // Métodos de configuración
    updateConfig,
    setDayViewHours,
    setWorkingSchedule,

    // Métodos de bloques de tiempo
    createBlocked,
    updateBlocked,
    deleteBlocked,
    addHoliday,

    // Métodos de disponibilidad
    getAvailability,
    checkAvailability
  }
}

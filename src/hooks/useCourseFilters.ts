'use client'

import type { Categoria, NivelCurso } from '@prisma/client'
import { useMemo, useState } from 'react'
import type { CourseFilters } from '@/components/course/CourseToolbar'
import type { GetInstructorCoursesProps } from '@/database'

const INITIAL_FILTERS: CourseFilters = {
  search: '',
  categoria: 'all',
  nivel: 'all',
  priceRange: [0, 200],
  calificacion: 0,
  etiquetas: [],
  sortBy: 'popular'
}

export function useCourseFilters(courses: GetInstructorCoursesProps[]) {
  const [filters, setFilters] = useState<CourseFilters>(INITIAL_FILTERS)

  const availableCategories = useMemo(() => {
    const allCategories = courses.map((course) => course.categoria).filter(Boolean) as Categoria[]
    const uniqueCategories = Array.from(new Map(allCategories.map((cat) => [cat.id, cat])).values())
    return uniqueCategories
  }, [courses])

  const availableTags = useMemo(() => {
    const allTags = courses.flatMap((course) => course.etiquetas)
    const uniqueTags = Array.from(new Map(allTags.map((tag) => [tag.id, tag])).values())
    return uniqueTags
  }, [courses])

  const availableLevels = useMemo(() => {
    const allLevels = courses.flatMap((course) => course.nivel)
    const uniqueLevels = Array.from(new Set(allLevels)) as NivelCurso[]
    return uniqueLevels
  }, [courses])

  const filteredAndSortedCourses = useMemo(() => {
    const filtered = courses.filter((course) => {
      const matchesSearch =
        filters.search === '' ||
        course.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.descripcion?.toLowerCase().includes(filters.search.toLowerCase())

      const matchesCategory = filters.categoria === 'all' || course.categoria?.id === filters.categoria
      const matchesLevel = filters.nivel === 'all' || course.nivel === filters.nivel
      const precioNum = typeof course.precio === 'number' ? course.precio : Number(course.precio || 0)
      const matchesPrice = precioNum >= filters.priceRange[0] && precioNum <= filters.priceRange[1]
      const matchesRating = filters.calificacion === 0 || course.calificacion >= filters.calificacion
      const matchesTags =
        filters.etiquetas.length === 0 || filters.etiquetas.some((tagId) => course.etiquetas.some((t) => t.id === tagId))

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice && matchesRating && matchesTags
    })

    const sorted = filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'popular':
          return b.inscripciones.length - a.inscripciones.length
        case 'rating':
          return b.calificacion - a.calificacion
        case 'newest':
          return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
        case 'price-low':
          return (
            (typeof a.precio === 'number' ? a.precio : Number(a.precio || 0)) -
            (typeof b.precio === 'number' ? b.precio : Number(b.precio || 0))
          )
        case 'price-high':
          return (
            (typeof b.precio === 'number' ? b.precio : Number(b.precio || 0)) -
            (typeof a.precio === 'number' ? a.precio : Number(a.precio || 0))
          )
        default:
          return 0
      }
    })

    return sorted
  }, [courses, filters])

  const handleFiltersChange = (newFilters: Partial<CourseFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS)
  }

  return {
    filters,
    setFilters: handleFiltersChange,
    clearFilters,
    filteredAndSortedCourses,
    availableCategories,
    availableTags,
    availableLevels
  }
}

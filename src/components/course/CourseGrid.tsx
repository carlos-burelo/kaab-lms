'use client'

import { UserRole } from '@prisma/client'
import { BookOpen } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCourseFilters } from '@/hooks/useCourseFilters'
// import type { CursoConDetalles } from '@/typings'
import { CourseCard } from './CourseCard'
import { CourseToolbar } from './CourseToolbar'

interface CourseGridProps {
  courses: any[]
  renderMode?: UserRole
}

export function CourseGrid({ courses, renderMode = UserRole.STUDENT }: CourseGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const { filters, setFilters, clearFilters, filteredAndSortedCourses, availableCategories, availableTags, availableLevels } =
    useCourseFilters(courses)

  return (
    <div className='space-y-6'>
      <CourseToolbar
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        availableCategories={availableCategories}
        availableLevels={availableLevels}
        availableTags={availableTags}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {filteredAndSortedCourses.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <BookOpen className='h-12 w-12 text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold mb-2'>No se encontraron cursos</h3>
          <p className='text-muted-foreground mb-4 max-w-md'>
            Intenta ajustar tus términos de búsqueda o filtros para encontrar los cursos que buscas.
          </p>
          <Button variant='outline' onClick={clearFilters}>
            Reiniciar filtros
          </Button>
        </div>
      ) : (
        <div
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}
        >
          {Array.isArray(filteredAndSortedCourses) &&
            filteredAndSortedCourses.map((course, index) => (
              <div key={course.id} className='opacity-0 animate-fade-in' style={{ animationDelay: `${index * 100}ms` }}>
                <CourseCard course={course} viewMode={viewMode} renderMode={renderMode} />
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

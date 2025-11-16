'use client'

import { BookOpen, File, Share2 } from 'lucide-react'
import Link from 'next/link'
import type { DetallesDelCurso } from './types'

interface CourseStepNavigatorProps {
  course: DetallesDelCurso | null
  currentStep: 'info' | 'contenido' | 'publicar'
}

const STEPS = [
  {
    id: 'info',
    label: 'Información',
    icon: File,
    description: 'Título, descripción y detalles'
  },
  {
    id: 'contenido',
    label: 'Contenido',
    icon: BookOpen,
    description: 'Módulos, lecciones y materiales'
  },
  {
    id: 'publicar',
    label: 'Publicar',
    icon: Share2,
    description: 'Revisar y publicar'
  }
] as const

export function CourseStepNavigator({ course, currentStep }: CourseStepNavigatorProps) {
  if (!course) return null

  const canAccessStep = (stepId: string) => {
    if (stepId === 'info') return true
    if (stepId === 'contenido') return true
    if (stepId === 'publicar') {
      return course.modules.length > 0 && course.modules.some((m: any) => m.lessons.length > 0)
    }

    return false
  }

  return (
    <div className='border-b bg-background sticky top-content-available z-50'>
      <div className='px-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-lg font-bold truncate'>{course.titulo || 'Nuevo Curso'}</h1>
          <div className='flex items-center gap-1'>
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isCurrentStep = step.id === currentStep
              const isAccessible = canAccessStep(step.id)

              return (
                <div key={step.id} className='flex items-center'>
                  <Link
                    href={`/instructor/cursos/${course.id}?step=${step.id}`}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                      isCurrentStep
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    } ${!isAccessible ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                    title={!isAccessible ? 'Completa el paso anterior para desbloquear' : ''}
                  >
                    <Icon className='w-4 h-4' />
                    <span className='hidden sm:inline'>{step.label}</span>
                  </Link>

                  {index < STEPS.length - 1 && <div className='w-px h-6 bg-border mx-1' />}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

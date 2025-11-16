'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { DetallesDelCurso } from './types'

interface CourseValidationAlertProps {
  course: DetallesDelCurso | null
}

export function CourseValidationAlert({ course }: CourseValidationAlertProps) {
  if (!course) return null

  const validaciones = {
    titulo: !!course.title?.trim(),
    descripcion: !!course.description?.trim(),
    categoria: !!course.categoryId,
    nivel: !!course.level,
    modulos: course.modules.length > 0,
    lecciones: course.modules.some((m: any) => m.lessons.length > 0),
    contenido: course.modules.some((m: any) => m.lessons.some((l: any) => l.contents.length > 0))
  }

  const todosValidos = Object.values(validaciones).every((v) => v)
  const completado = Object.values(validaciones).filter((v) => v).length

  if (todosValidos) {
    return (
      <Alert className='border-green-200 bg-green-50 mb-4'>
        <CheckCircle2 className='h-4 w-4 text-green-600' />
        <AlertTitle className='text-green-900'>¡Curso completo!</AlertTitle>
        <AlertDescription className='text-green-800'>
          Tu curso está listo para avanzar al siguiente paso. Puedes acceder a "{completado === 7 ? 'Publicar' : 'Contenido'}" en
          el navegador superior.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant='destructive' className='mb-4'>
      <AlertCircle className='h-4 w-4' />
      <AlertTitle>Información incompleta</AlertTitle>
      <AlertDescription>
        <div className='mt-2 space-y-1'>
          {!validaciones.titulo && <div>• Agrega un título al curso</div>}
          {!validaciones.descripcion && <div>• Agrega una descripción al curso</div>}
          {!validaciones.categoria && <div>• Selecciona una categoría</div>}
          {!validaciones.nivel && <div>• Selecciona un nivel de dificultad</div>}
          {!validaciones.modulos && <div>• Crea al menos un módulo en la sección "Contenido"</div>}
          {!validaciones.lecciones && <div>• Cada módulo debe tener al menos una lección</div>}
          {!validaciones.contenido && <div>• Cada lección debe tener contenido</div>}
        </div>
      </AlertDescription>
    </Alert>
  )
}

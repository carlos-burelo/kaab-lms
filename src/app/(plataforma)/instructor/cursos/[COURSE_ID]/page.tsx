import { redirect } from 'next/navigation'
import { getCourseById } from '@/actions/courseActions'
import { CourseContentForm } from '@/components/course/creator/CourseContentForm'
import { CourseInfoForm } from '@/components/course/creator/CourseInfoForm'
import { CourseStepNavigator } from '@/components/course/creator/CourseStepNavigator'
import { PublishCourseForm } from '@/components/course/creator/PublishCourseForm'

interface CrearEditarCursoPageProps {
  params: Promise<{ COURSE_ID: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CrearEditarCursoPage({ params, searchParams }: CrearEditarCursoPageProps) {
  const { COURSE_ID } = await params
  const { step, leccion } = await searchParams
  const IS_NEW = COURSE_ID === 'nuevo'

  const course = IS_NEW ? null : await getCourseById(COURSE_ID)

  if (!IS_NEW && !course) return redirect('/instructor/cursos')

  // Determinar paso actual
  const currentStep = (step as 'info' | 'contenido' | 'publicar') || 'info'

  // Para cursos nuevos, redirigir a info si es otro paso
  if (IS_NEW && step !== 'info') {
    return redirect(`/instructor/cursos/nuevo?step=info`)
  }

  const content = (() => {
    switch (currentStep) {
      case 'info':
        return <CourseInfoForm isNew={IS_NEW} course={course} />
      case 'contenido':
        return <CourseContentForm isNew={IS_NEW} course={course} leccionId={leccion as string | undefined} />
      case 'publicar':
        return <PublishCourseForm course={course} />
      default:
        return <CourseInfoForm isNew={IS_NEW} course={course} />
    }
  })()

  return (
    <div className='flex flex-col bg-background'>
      {!IS_NEW && course && <CourseStepNavigator course={course} currentStep={currentStep} />}
      <div className='flex-1 overflow-y-auto'>{content}</div>
    </div>
  )
}

import { CourseContentEditor } from './CourseContentEditor'
import CourseContentSidebar from './CourseContentSidebar'
import type { CourseForm } from './types'

interface CourseContentFormProps extends CourseForm {
  leccionId?: string
}

export function CourseContentForm({ course, leccionId }: CourseContentFormProps) {
  const firstLessonId = leccionId || course?.modules?.[0]?.lessons?.[0]?.id

  return (
    <div className='grid grid-cols-12 h-content-available'>
      <aside className='col-span-3 border-r overflow-y-auto'>
        <CourseContentSidebar course={course} />
      </aside>
      {firstLessonId ? (
        <CourseContentEditor lessonId={firstLessonId} courseId={course!.id} />
      ) : (
        <main className='p-2 w-full col-span-9 overflow-y-auto'>
          <div className='text-center py-12'>
            <p className='text-muted-foreground mb-4'>No hay lecciones. Crea una módulo y lección para empezar.</p>
          </div>
        </main>
      )}
    </div>
  )
}

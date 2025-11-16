import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface CourseLessonNavigatorProps {
  courseSlug: string
  modules: any[]
  currentLessonId: string
}

export function CourseLessonNavigator({ courseSlug, modules, currentLessonId }: CourseLessonNavigatorProps) {
  const allLessons = modules.flatMap((m: any) => m.lessons)
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId)
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  return (
    <footer className='sticky bottom-0 bg-background/80 backdrop-blur-sm p-2 border-t border-muted'>
      <div className='max-w-4xl mx-auto flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          ¿Tienes un problema con este contenido?
          <Link href='#' className='text-sm underline font-medium'>
            Reportalo
          </Link>
        </div>

        <div className='flex items-center gap-3'>
          {previousLesson ? (
            <Button variant='ghost' size='sm' asChild>
              <Link href={`/estudiante/cursos/${courseSlug}/leccion/${previousLesson.id}`}>
                <ChevronLeftIcon className='h-4 w-4 mr-2' />
                <span className='hidden sm:block'>Atrás</span>
              </Link>
            </Button>
          ) : (
            <Button variant='ghost' size='sm' disabled title='No hay lecciones anteriores'>
              <ChevronLeftIcon className='h-4 w-4 mr-2' />
              <span className='hidden sm:block'>Atrás</span>
            </Button>
          )}

          {nextLesson ? (
            <Button variant='default' size='sm' asChild>
              <Link href={`/estudiante/cursos/${courseSlug}/leccion/${nextLesson.id}`}>
                <span className='hidden sm:block'>Siguiente Capítulo</span>
                <ChevronRightIcon className='h-4 w-4 ml-2' />
              </Link>
            </Button>
          ) : (
            <Button variant='default' size='sm' disabled title='No hay más lecciones'>
              <span className='hidden sm:block'>Siguiente Capítulo</span>
              <ChevronRightIcon className='h-4 w-4 ml-2' />
            </Button>
          )}
        </div>
      </div>
    </footer>
  )
}

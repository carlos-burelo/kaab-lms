import { UserRole } from '@prisma/client'
import { ChartAreaIcon, ClockIcon, FileTextIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

interface CourseCardProps {
  course: any
  renderMode: UserRole
  viewMode: ViewMode
}

export function CourseCard({ course, renderMode, viewMode }: CourseCardProps) {
  const IS_LIST = viewMode === 'list'
  const IS_INSTRUCTOR = renderMode === UserRole.INSTRUCTOR
  const TITLE = course.title || 'Sin título'
  const IMAGE = course.image?.url || '/fallback-course.svg'
  const PUBLISHED = course.isPublished ? 'Publicado' : 'Borrador'
  const CATEGORY = course.category?.name || 'Sin categoría'
  const TOTAL_LESSONS = course.modules?.reduce((total: number, modulo: any) => total + modulo.lessons?.length || 0, 0) || 0
  const TOTAL_MINUTES =
    course.modules?.reduce((total: number, modulo: any) => {
      return total + (modulo.lessons?.reduce((acc: number, leccion: any) => acc + (leccion?.durationMinutes ?? 0), 0) || 0)
    }, 0) || 0
  const TOTAL_HOURS = Math.floor(TOTAL_MINUTES / 60)
  const LEVEL = course.level || 'N/A'
  const PRICE = course.price ? `$${course.price.toFixed(2)}` : 'Gratis'
  const LINK = IS_INSTRUCTOR ? `/instructor/cursos/${course.id}` : `/estudiante/cursos/${course.slug}`
  const ACTION_LINK = IS_INSTRUCTOR ? `/instructor/cursos/${course.id}/analiticas` : LINK

  return (
    <div className={cn('rounded-md border border-border bg-card overflow-hidden', { flex: IS_LIST })}>
      <header className={cn('relative h-full border-b aspect-video w-full', { 'border-0': IS_LIST })}>
        <Image
          className={cn('w-full h-full object-cover rounded-t-md aspect-video', { 'rounded-md max-w-80': IS_LIST })}
          src={IMAGE}
          alt={course.title}
          width={200}
          height={100}
        />

        <div className='absolute top-2 left-2 border border-border bg-background text-xs px-2 py-1 rounded-sm'>
          <span>{LEVEL}</span>
        </div>
        {IS_INSTRUCTOR && (
          <div className='absolute top-2 right-2 border border-border bg-background text-xs px-2 py-1 rounded-sm'>
            {PUBLISHED}
          </div>
        )}
      </header>
      <div className={cn('w-full', { 'flex flex-col justify-center flex-1': IS_LIST })}>
        <section className='p-2 lg:p-4 w-full'>
          <div className='grid grid-flow-col justify-between items-center mb-2'>
            <div className='text-xs text-muted-foreground'>{CATEGORY}</div>
            <div className='flex gap-2'>
              <div className='flex gap-1 items-center'>
                <FileTextIcon className='inline-block w-3 h-3 text-muted-foreground' />
                <span className='text-xs text-foreground'>{TOTAL_LESSONS}</span>
              </div>
              <div className='flex gap-1 items-center'>
                <ClockIcon className='inline-block w-3 h-3 text-muted-foreground' />
                <span className='text-xs text-foreground'>{TOTAL_HOURS}</span>
              </div>
            </div>
          </div>
          <Link href={LINK}>
            <div className='text-lg font-semibold truncate line-clamp-1'>{TITLE}</div>
          </Link>
        </section>
        <footer className='p-2 lg:p-4 border-t w-full text-sm text-muted-foreground grid grid-flow-col items-center justify-between'>
          <Button asChild size='sm' variant='outline'>
            <Link href={ACTION_LINK}>
              {IS_INSTRUCTOR ? <ChartAreaIcon className='inline-block w-4 h-4 mr-1' /> : null}
              {IS_INSTRUCTOR ? 'Metricas' : 'Ver Curso'}
            </Link>
          </Button>
          <h3 className='text-primary font-semibold text-md'>{PRICE}</h3>
        </footer>
      </div>
    </div>
  )
}

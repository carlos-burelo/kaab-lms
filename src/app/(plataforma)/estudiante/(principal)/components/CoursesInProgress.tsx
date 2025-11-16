import type { Prisma } from '@prisma/client'
import { BookOpenIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment } from 'react'
import { Button } from '@/components/ui/button'
import { Item, ItemGroup, ItemSeparator } from '@/components/ui/item'

type CoursesInProgressProps = {
  enrollments: Prisma.EnrollmentGetPayload<{
    include: {
      course: {
        include: {
          image: true
          modules: {
            select: {
              id: true
            }
          }
        }
      }
    }
  }>[]
}

export function CoursesInProgress({ data }: { data: CoursesInProgressProps | null }) {
  if (!data)
    return (
      <section>
        <header className='flex justify-between items-center mb-2'>
          <h2 className='text-lg font-semibold'>Tus cursos en progreso</h2>
          <Link href='/estudiante/cursos' className='text-sm text-primary underline'>
            Ver todos
          </Link>
        </header>
        <p className='text-sm text-muted-foreground'>No tienes cursos en progreso.</p>
      </section>
    )

  return (
    <section>
      <header className='flex justify-between items-center mb-2'>
        <h2 className='text-lg font-semibold'>Tus cursos en progreso ({data.enrollments.length})</h2>
        <Link href='/estudiante/cursos' className='text-sm text-primary underline'>
          Ver todos
        </Link>
      </header>
      <ItemGroup className='border rounded-lg border-muted-foreground/20'>
        {data?.enrollments.map((enrollment, index) => (
          <Fragment key={enrollment.id}>
            <Item key={enrollment.id} className='grid md:flex'>
              <Image
                src={enrollment.course.image?.url || '/placeholder-course.png'}
                alt={enrollment.course.title}
                width={100}
                height={100}
                className='object-cover rounded-md h-32 w-full md:h-16 md:w-auto aspect-video'
              />
              <div className='md:flex-1 grid md:grid-flow-col gap-2'>
                <div className='grid md:w-sm overflow-hidden gap-1'>
                  <div className='flex items-center gap-2'>
                    <div className='bg-primary/30 p-1 size-6 aspect-square text-xs rounded-sm flex items-center justify-center '>
                      <BookOpenIcon className='text-primary size-4 stroke-2' />
                    </div>
                    <span className='text-muted-foreground text-xs'>Curso</span>
                  </div>
                  <h3 className='text-sm font-semibold truncate line-clamp-1'>{enrollment.course.title}</h3>
                </div>
                <div>
                  <p>Lecciones</p>
                  <p className='text-sm text-muted-foreground'>
                    {enrollment.course.modules.length} Modulo
                    {enrollment.course.modules.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className='grid items-center'>
                  <Button variant='outline' className='w-fit' size='sm' asChild>
                    <Link href={`/estudiante/cursos/${enrollment.course.id}`}>Ir al curso</Link>
                  </Button>
                </div>
              </div>
            </Item>
            {index !== data.enrollments.length - 1 && <ItemSeparator className='h-0.5' />}
          </Fragment>
        ))}
      </ItemGroup>
    </section>
  )
}

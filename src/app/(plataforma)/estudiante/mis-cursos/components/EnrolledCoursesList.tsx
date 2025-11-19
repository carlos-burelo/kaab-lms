'use client'

import type { Prisma } from '@prisma/client'
import { BookOpenIcon, CalendarIcon, ClockIcon, TrophyIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type EnrollmentWithCourse = Prisma.EnrollmentGetPayload<{
  include: {
    course: {
      include: {
        instructor: {
          include: {
            user: true
          }
        }
        category: true
        image: true
        tags: true
      }
    }
  }
}>

interface EnrolledCoursesListProps {
  enrollments: EnrollmentWithCourse[]
}

export function EnrolledCoursesList({ enrollments }: EnrolledCoursesListProps) {
  const [activeTab, setActiveTab] = useState('all')

  const filteredEnrollments = useMemo(() => {
    switch (activeTab) {
      case 'in-progress':
        return enrollments.filter((e) => !e.isCompleted && e.progress > 0)
      case 'not-started':
        return enrollments.filter((e) => e.progress === 0)
      case 'completed':
        return enrollments.filter((e) => e.isCompleted)
      default:
        return enrollments
    }
  }, [activeTab, enrollments])

  const stats = useMemo(() => {
    return {
      all: enrollments.length,
      inProgress: enrollments.filter((e) => !e.isCompleted && e.progress > 0).length,
      notStarted: enrollments.filter((e) => e.progress === 0).length,
      completed: enrollments.filter((e) => e.isCompleted).length
    }
  }, [enrollments])

  return (
    <div>
      <Tabs defaultValue='all' value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='mb-6'>
          <TabsTrigger value='all'>Todos ({stats.all})</TabsTrigger>
          <TabsTrigger value='in-progress'>En progreso ({stats.inProgress})</TabsTrigger>
          <TabsTrigger value='not-started'>Sin comenzar ({stats.notStarted})</TabsTrigger>
          <TabsTrigger value='completed'>Completados ({stats.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className='mt-0'>
          {filteredEnrollments.length === 0 ? (
            <div className='text-center py-12 text-muted-foreground'>
              <p>No hay cursos en esta categoría</p>
            </div>
          ) : (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {filteredEnrollments.map((enrollment) => (
                <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EnrolledCourseCard({ enrollment }: { enrollment: EnrollmentWithCourse }) {
  const { course } = enrollment
  const imageUrl = course.image?.url || '/fallback-course.svg'
  const instructorName = (course.instructor?.user as any)?.profile?.name || course.instructor?.user?.email || 'Instructor'
  const categoryName = course.category?.name || 'Sin categoría'

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = () => {
    if (enrollment.isCompleted) {
      return (
        <Badge variant='default' className='bg-green-500'>
          Completado
        </Badge>
      )
    }
    if (enrollment.progress > 0) {
      return (
        <Badge variant='default' className='bg-blue-500'>
          En progreso
        </Badge>
      )
    }
    return <Badge variant='secondary'>Sin comenzar</Badge>
  }

  return (
    <Card className='overflow-hidden hover:shadow-lg transition-shadow'>
      <Link href={`/estudiante/cursos/${course.id}`}>
        <div className='relative aspect-video'>
          <Image src={imageUrl} alt={course.title} fill className='object-cover' />
          {enrollment.isCompleted && (
            <div className='absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full'>
              <TrophyIcon className='w-4 h-4' />
            </div>
          )}
        </div>
      </Link>

      <div className='p-4'>
        <div className='flex items-start justify-between gap-2 mb-2'>
          <div className='text-xs text-muted-foreground'>{categoryName}</div>
          {getStatusBadge()}
        </div>

        <Link href={`/estudiante/cursos/${course.id}`}>
          <h3 className='font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors'>{course.title}</h3>
        </Link>

        <p className='text-sm text-muted-foreground mb-4 line-clamp-2'>{course.description || 'Sin descripción'}</p>

        <div className='space-y-3'>
          <div>
            <div className='flex items-center justify-between text-xs mb-1'>
              <span className='text-muted-foreground'>Progreso</span>
              <span className='font-semibold'>{Math.round(enrollment.progress)}%</span>
            </div>
            <Progress value={enrollment.progress} className='h-2' />
          </div>

          <div className='flex items-center gap-4 text-xs text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <BookOpenIcon className='w-3 h-3' />
              <span>{instructorName}</span>
            </div>
            {enrollment.totalTimeMinutes > 0 && (
              <div className='flex items-center gap-1'>
                <ClockIcon className='w-3 h-3' />
                <span>{Math.round(enrollment.totalTimeMinutes / 60)}h</span>
              </div>
            )}
          </div>

          {enrollment.lastAccessed && (
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
              <CalendarIcon className='w-3 h-3' />
              <span>Último acceso: {formatDate(enrollment.lastAccessed)}</span>
            </div>
          )}
        </div>

        <div className='mt-4'>
          <Button asChild className='w-full' variant={enrollment.progress > 0 ? 'default' : 'outline'}>
            <Link href={`/estudiante/cursos/${course.id}`}>
              {enrollment.isCompleted ? 'Revisar curso' : enrollment.progress > 0 ? 'Continuar aprendiendo' : 'Comenzar curso'}
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}

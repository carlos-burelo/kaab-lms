import { ArrowLeft, BookMarked } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { EnrollmentStats } from '@/components/enrollments/EnrollmentStats'
import { EnrollmentsList } from '@/components/enrollments/EnrollmentsList'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { courseRepository, enrollmentRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

interface EnrollmentsPageProps {
  searchParams: Promise<{
    courseId?: string
  }>
}

export default async function EnrollmentsPage({ searchParams }: EnrollmentsPageProps) {
  const session = await getSession()

  if (!session?.id) {
    redirect('/sign-in')
  }

  const { courseId: selectedCourseId } = await searchParams

  // Get instructor's courses
  const courses = await courseRepository.getInstructorCourses(session.id)

  if (courses.length === 0) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='sm' asChild>
            <Link href='/instructor'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className='text-3xl font-bold'>Enrollments</h1>
            <p className='text-muted-foreground'>Manage student enrollments and progress</p>
          </div>
        </div>

        <Card>
          <CardContent className='text-center py-12'>
            <BookMarked className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
            <p className='text-muted-foreground'>You haven't created any courses yet.</p>
            <Button asChild className='mt-4'>
              <Link href='/instructor/cursos'>Create a Course</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const courseId = selectedCourseId || courses[0].id
  const _selectedCourse = courses.find((c) => c.id === courseId) || courses[0]

  // Get enrollments for selected course
  const enrollmentsResult = await enrollmentRepository.getEnrollmentsByCourse(courseId, {
    limit: 50,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // Get statistics
  const stats = await enrollmentRepository.getCourseEnrollmentStats(courseId)

  return (
    <div className='space-y-8 pb-8'>
      {/* Header */}
      <div className='space-y-4'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='sm' asChild>
            <Link href='/instructor'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className='text-3xl font-bold'>Enrollments</h1>
            <p className='text-muted-foreground'>Manage student enrollments and progress</p>
          </div>
        </div>

        {/* Course Selection */}
        <div className='max-w-xs'>
          <form method='GET'>
            <Select
              value={courseId}
              onValueChange={(value) => {
                // Navigate to same page with different courseId
                window.location.href = `/instructor/enrollments?courseId=${value}`
              }}
              defaultValue={courseId}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </form>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <EnrollmentStats courseId={courseId} initialStats={stats} />

      {/* Enrollments List */}
      <EnrollmentsList courseId={courseId} initialData={enrollmentsResult} />
    </div>
  )
}

import { ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { QuestionManager } from '@/components/quiz/instructor/QuestionManager'
import { QuizForm } from '@/components/quiz/instructor/QuizForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { courseRepository } from '@/database/repositories'

interface QuizPageProps {
  params: Promise<{
    COURSE_ID: string
  }>
  searchParams: Promise<{
    lesson?: string
  }>
}

export default async function QuizPage({ params, searchParams }: QuizPageProps) {
  const { COURSE_ID: courseId } = await params
  const { lesson: lessonId } = await searchParams

  const course = await courseRepository.getById(courseId)
  if (!course) {
    notFound()
  }

  // Find the selected lesson
  let selectedLesson = null
  if (lessonId) {
    const module = course.modules?.find((m: any) => m.lessons?.some((l: any) => l.id === lessonId))
    selectedLesson = module?.lessons?.find((l: any) => l.id === lessonId)
  }

  if (!selectedLesson && lessonId) {
    notFound()
  }

  // Get all lessons for the course
  const allLessons = course.modules?.flatMap((m: any) => m.lessons) || []

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='sm' asChild>
          <Link href={`/instructor/cursos/${courseId}`}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Course
          </Link>
        </Button>
        <div>
          <h1 className='text-3xl font-bold'>{course.title}</h1>
          <p className='text-muted-foreground'>Manage Course Quizzes</p>
        </div>
      </div>

      {!selectedLesson ? (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BookOpen className='h-5 w-5' />
              Select a Lesson
            </CardTitle>
            <CardDescription>Choose a lesson to create or edit its quiz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
              {allLessons.length === 0 ? (
                <p className='text-muted-foreground col-span-full'>No lessons found in this course. Create lessons first.</p>
              ) : (
                allLessons.map((lesson: any) => (
                  <Link key={lesson.id} href={`/instructor/cursos/${courseId}/quiz?lesson=${lesson.id}`}>
                    <div className='p-4 border rounded-lg hover:bg-muted transition-colors cursor-pointer'>
                      <h3 className='font-medium truncate'>{lesson.title}</h3>
                      <p className='text-sm text-muted-foreground'>{lesson.quiz ? 'Quiz exists' : 'No quiz yet'}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Selected Lesson</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='font-medium'>{selectedLesson.title}</p>
              {selectedLesson.description && <p className='text-sm text-muted-foreground mt-1'>{selectedLesson.description}</p>}
            </CardContent>
          </Card>

          {selectedLesson.quiz ? (
            <>
              <QuizForm lessonId={selectedLesson.id} initialData={selectedLesson.quiz as any} />
              <QuestionManager quizId={selectedLesson.quiz.id} questions={(selectedLesson.quiz.questions as any) || []} />
            </>
          ) : (
            <QuizForm lessonId={selectedLesson.id} />
          )}
        </div>
      )}
    </div>
  )
}

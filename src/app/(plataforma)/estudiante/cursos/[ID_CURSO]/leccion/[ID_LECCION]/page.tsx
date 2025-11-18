import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CourseContent } from '@/components/course/CourseContent'
import { CourseAttachmentZone } from '@/components/course/viewer/CourseAttachmentZone'
import { CourseDiscussionZone } from '@/components/course/viewer/CourseDiscussionZone'
import { CourseLessonNavigator } from '@/components/course/viewer/CourseLessonNavigator'
import { CourseLessonsZone } from '@/components/course/viewer/CourseLessonsZone'
import { TabsList } from '@/components/extensions/tab-list'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { courseRepository } from '@/database/repositories'
import { getQuizByLessonId, getQuizQuestionsForStudent } from '@/actions/quiz.actions'
import { QuizViewer } from '@/components/quiz/student/QuizViewer'
import { getSession } from '@/lib/auth'
import { prisma } from '@/database/client'
import { AssignmentSubmission } from '@/components/assignments/AssignmentSubmission'

interface LeccionPageProps {
  params: Promise<{
    ID_CURSO: string
    ID_LECCION: string
  }>
}

export default async function Lession({ params }: LeccionPageProps) {
  const { ID_LECCION: leccionId } = await params

  const leccion = await courseRepository.getLesson(leccionId)

  if (!leccion) {
    notFound()
  }

  // Get the course with all modules and lessons
  const curso = await courseRepository.getById(leccion.module.courseId)

  if (!curso) {
    notFound()
  }

  // Get session for quiz
  const session = await getSession()
  const userId = session?.id || ''

  // Get quiz if exists
  const quizResult = await getQuizByLessonId(leccionId)
  let quizData = null

  if (quizResult.success && quizResult.data && userId) {
    const questionsResult = await getQuizQuestionsForStudent(quizResult.data.id)
    if (questionsResult.success) {
      quizData = questionsResult.data
    }
  }

  // Get assignment if exists
  const assignment = await prisma.assignment.findFirst({
    where: { lessonId: leccionId },
    include: {
      submissions: {
        where: { userId },
        include: { files: true }
      }
    }
  })

  const studentSubmission = assignment?.submissions?.[0] || null

  const SLUG = curso.slug
  const TITLE = curso.title
  const COURSE_URL = `/estudiante/cursos/${SLUG}`

  return (
    <div className='flex bg-background text-foreground'>
      <ScrollArea className='flex-1 flex flex-col overflow-y-auto h-content-available'>
        <header className='flex items-center justify-between border-b p-2 border-muted sticky top-0 bg-background z-10'>
          <div className='flex items-center gap-4'>
            <Link href={COURSE_URL} className='font-semibold text-sm truncate hover:underline'>
              {TITLE}
            </Link>
          </div>
        </header>

        <div className='gap-2 grid p-2'>
          {leccion.contents?.map((item: any) => (
            <CourseContent key={item.id} {...item} />
          ))}

          {quizData && (
            <div className='mt-6'>
              <QuizViewer
                quiz={quizData.quiz}
                questions={quizData.questions}
                userId={userId}
              />
            </div>
          )}

          {assignment && (
            <div className='mt-6'>
              <AssignmentSubmission
                assignment={assignment}
                courseId={curso.id}
                studentSubmission={studentSubmission}
              />
            </div>
          )}
        </div>

        <CourseLessonNavigator courseSlug={curso.slug} modules={curso.modules || []} currentLessonId={leccion.id} />
      </ScrollArea>

      <aside className='w-96 hidden lg:flex flex-col border-l border-muted overflow-y-auto'>
        <Tabs defaultValue='content' className='grid sticky top-content-available h-content-available content-start'>
          <div className='flex items-center justify-between border-b border-muted'>
            <TabsList
              items={[
                { value: 'content', label: 'Contenido' },
                { value: 'discussion', label: 'Foro' },
                { value: 'file', label: 'Adjuntos' }
              ]}
            />
          </div>
          <TabsContent value='content' className='flex-1 overflow-y-auto p-0'>
            <CourseLessonsZone modules={curso.modules || []} lesson={leccion} courseSlug={curso.slug} />
          </TabsContent>

          <TabsContent value='discussion' className='flex-1 p-0'>
            <CourseDiscussionZone courseId={curso.id} />
          </TabsContent>

          <TabsContent value='file' className='flex-1 p-6 space-y-3'>
            <CourseAttachmentZone leccion={leccion} />
          </TabsContent>
        </Tabs>
      </aside>
    </div>
  )
}

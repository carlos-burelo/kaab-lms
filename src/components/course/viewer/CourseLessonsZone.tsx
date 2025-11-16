import { CheckCircleIcon, PlayCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'

interface CourseContentSidebarProps {
  modules: any[]
  lesson: any
  courseSlug: string
}

export function CourseLessonsZone({ modules, lesson, courseSlug }: CourseContentSidebarProps) {
  return (
    <ScrollArea className='h-full'>
      <Accordion type='single' collapsible defaultValue={lesson.moduleId} className='w-full'>
        {modules.map((module: any) => (
          <AccordionItem value={module.id} key={module.id}>
            <AccordionTrigger className='px-4 py-3 text-sm font-semibold hover:no-underline'>{module.title}</AccordionTrigger>
            <AccordionContent>
              <ul className='space-y-1'>
                {module.lessons.map((lessonItem: any) => {
                  const isCurrent = lessonItem.id === lesson.id
                  const isCompleted = lessonItem?.progress?.some((p: any) => p.isCompleted) && !isCurrent
                  return (
                    <LessonItem
                      key={lessonItem.id}
                      lesson={lessonItem}
                      isCurrent={isCurrent}
                      isCompleted={isCompleted}
                      courseSlug={courseSlug}
                    />
                  )
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollArea>
  )
}

interface LessonItemProps {
  lesson: any
  isCurrent: boolean
  isCompleted: boolean
  courseSlug: string
}

function LessonItem({ lesson, isCurrent, isCompleted, courseSlug }: LessonItemProps) {
  const href = `/estudiante/cursos/${courseSlug}/leccion/${lesson.id}`

  return (
    <li className='list-none'>
      <Link
        href={href}
        className={`flex items-center py-2.5 pr-3 pl-4 rounded-r-md border-l-4 ${
          isCurrent ? 'bg-primary/10 border-primary' : 'border-transparent bg-transparent'
        }`}
      >
        <span className='flex items-center gap-3 flex-1'>
          {isCompleted ? (
            <CheckCircleIcon className='h-4 w-4 text-primary shrink-0' />
          ) : (
            <PlayCircleIcon className='h-4 w-4 text-muted-foreground shrink-0' />
          )}
          <span
            className={`flex-1 text-sm ${
              isCurrent
                ? 'font-medium text-primary'
                : isCompleted
                  ? 'text-muted-foreground line-through'
                  : 'text-muted-foreground'
            }`}
          >
            {lesson.title}
          </span>
        </span>
      </Link>
    </li>
  )
}

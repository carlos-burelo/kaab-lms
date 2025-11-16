import { Award, AwardIcon, BadgeCheck, Clock, Lock, PlayCircle, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { courseRepository } from '@/database/repositories'
import { getInitials } from '@/utils/string'

interface PageProps {
  params: Promise<{ ID_CURSO: string }>
}

export default async function CoursePage({ params }: PageProps) {
  const { ID_CURSO: courseSlug } = await params

  // Get course by slug - more efficient than full text search
  const curso = await courseRepository.getBySlug(courseSlug)

  if (!curso) {
    notFound()
  }

  const instructor = curso.instructor?.user || null

  const totalLessons = curso.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0
  const firstLesson = curso.modules?.[0]?.lessons?.[0]

  // Calculate total duration in minutes
  const totalDuration = curso.durationMinutes || 0
  const hours = Math.floor(totalDuration / 60)
  const minutes = totalDuration % 60

  // Build dynamic details based on course
  const details = [
    {
      icon: Clock,
      text: hours > 0 ? `${hours}h ${minutes}m` : minutes > 0 ? `${minutes}m` : 'Duration not specified'
    },
    {
      icon: BadgeCheck,
      text: 'Completion Certificate'
    },
    {
      icon: Award,
      text: `Level: ${curso.level || 'Not specified'}`
    }
  ]

  // Add requirements if they exist
  if (Array.isArray(curso.requirements) && curso.requirements.length > 0) {
    details.push({
      icon: Lock,
      text: `${curso.requirements.length} requirement${curso.requirements.length !== 1 ? 's' : ''}`
    })
  }

  return (
    <>
      <div className='grid grid-cols-10 bg-muted/50 px-4 py-10'>
        <div className='grid gap-6 content-center col-span-10 lg:col-span-6'>
          <h1 className='text-3xl md:text-5xl leading-snug font-bold tracking-tight'>{curso.title}</h1>

          <div className='flex flex-wrap gap-2'>
            {(curso.tags || []).map((tag: any) => (
              <Badge key={tag.id} variant='secondary'>
                {tag.name}
              </Badge>
            ))}
          </div>

          {instructor && (
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Avatar className='h-8 w-8'>
                <AvatarFallback>{getInitials(instructor.email)}</AvatarFallback>
              </Avatar>
              <span>
                Trainer: <span className='font-medium text-primary'>{instructor.email}</span>
              </span>
            </div>
          )}

          <div className='flex flex-col sm:flex-row gap-4'>
            {firstLesson ? (
              <Button size='lg' className='w-full sm:w-auto' asChild>
                <Link href={`/estudiante/cursos/${curso.slug}/leccion/${firstLesson.id}`}>
                  <PlayCircle className='w-5 h-5 mr-2' />
                  Start course
                </Link>
              </Button>
            ) : (
              <Button size='lg' className='w-full sm:w-auto' disabled title='This course has no lessons yet'>
                <PlayCircle className='w-5 h-5 mr-2' />
                Start course
              </Button>
            )}
            <Button size='lg' variant='outline' className='w-full sm:w-auto'>
              <Star className='w-5 h-5 mr-2' />
              Agregar a favoritos
            </Button>
          </div>
        </div>
        <div className='grid col-span-10 lg:col-span-4 mt-8 lg:mt-0'>
          <Card className='overflow-hidden group p-0'>
            <AspectRatio ratio={16 / 9} className='bg-muted'>
              <Image
                src={curso.image?.url || '/placeholder-video.jpg'}
                alt={curso.title}
                fill
                className='object-cover transition-transform group-hover:scale-105'
              />
            </AspectRatio>
          </Card>
        </div>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 p-4'>
        <div className='lg:col-span-2 space-y-6'>
          <div className='prose prose-zinc dark:prose-invert max-w-none text-muted-foreground'>
            <p>{curso.description}</p>
          </div>

          <Card className='flex flex-col md:flex-row items-center gap-6 p-6 bg-muted/30'>
            <div className='shrink-0'>
              <AwardIcon className='w-16 h-16 text-primary hidden md:block' />
            </div>
            <div>
              <CardTitle className='text-lg font-semibold mb-2'>Get your completion certificate</CardTitle>
              <CardDescription>
                Add these credentials to your LinkedIn profile, resume or CV. Share them on social media and in your performance
                reviews.
              </CardDescription>
            </div>
          </Card>

          <div className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Course Content</h2>
            <p className='text-sm text-muted-foreground'>
              {curso.modules?.length || 0} section
              {(curso.modules?.length || 0) !== 1 ? 's' : ''} • {totalLessons} chapter
              {totalLessons !== 1 ? 's' : ''}
            </p>
            <Accordion type='single' collapsible className='w-full'>
              {(curso.modules || []).map((module: any) => (
                <AccordionItem value={`module-${module.id}`} key={module.id}>
                  <AccordionTrigger className='text-base font-medium hover:no-underline'>
                    <div className='flex justify-between w-full pr-4'>
                      <span>{module.title}</span>
                      <span className='text-sm text-muted-foreground font-normal'>
                        {module.lessons?.length || 0} chapter
                        {(module.lessons?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className='space-y-1 pl-4'>
                      {(module.lessons || []).map((lesson: any) => (
                        <Link
                          key={lesson.id}
                          href={`/estudiante/cursos/${curso.slug}/leccion/${lesson.id}`}
                          className='flex items-center justify-between text-muted-foreground hover:text-primary transition-colors p-2 rounded-md'
                        >
                          <span className='flex items-center gap-3'>
                            {lesson.isFree ? (
                              <PlayCircle className='w-4 h-4 text-green-500 shrink-0' />
                            ) : (
                              <Lock className='w-4 h-4 shrink-0' />
                            )}
                            {lesson.title}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <div className='lg:col-span-1 space-y-6'>
          <div className='lg:sticky lg:top-24 space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Course Details</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-4'>
                  {details.map((item, index) => (
                    <li key={`detail-${index}`} className='flex items-center gap-3 text-sm'>
                      <item.icon className='w-5 h-5 text-muted-foreground shrink-0' />
                      <span className='font-medium'>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {instructor && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Instructor</CardTitle>
                </CardHeader>
                <CardContent className='flex items-center gap-4'>
                  <Avatar className='h-16 w-16'>
                    <AvatarFallback>{getInitials(instructor.email)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className='font-semibold text-base'>{instructor.email}</h3>
                    <p className='text-sm text-muted-foreground'>Course Instructor</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

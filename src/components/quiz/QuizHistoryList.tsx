'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Brain,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  ChevronDown,
  ChevronUp,
  Target
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

type QuizAttempt = {
  id: string
  quizId: string
  score: number
  maxScore: number
  passed: boolean
  attemptNumber: number
  startedAt: Date
  completedAt?: Date | null
  quiz: {
    id: string
    title: string
    description?: string | null
    passingScore: number
    lesson: {
      id: string
      title: string
      module: {
        course: {
          id: string
          title: string
        }
      }
    }
  }
}

interface QuizHistoryListProps {
  attempts: QuizAttempt[]
}

export function QuizHistoryList({ attempts }: QuizHistoryListProps) {
  const [expandedAttempts, setExpandedAttempts] = useState<Set<string>>(new Set())

  const toggleExpanded = (attemptId: string) => {
    const newExpanded = new Set(expandedAttempts)
    if (newExpanded.has(attemptId)) {
      newExpanded.delete(attemptId)
    } else {
      newExpanded.add(attemptId)
    }
    setExpandedAttempts(newExpanded)
  }

  if (!attempts || attempts.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <Brain className='h-16 w-16 text-muted-foreground mb-4' />
          <p className='text-muted-foreground text-center'>Aún no has realizado ninguna evaluación</p>
          <p className='text-sm text-muted-foreground text-center mt-2'>
            Inscríbete en un curso y comienza a aprender
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate statistics
  const totalAttempts = attempts.length
  const passedAttempts = attempts.filter((a) => a.passed).length
  const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0
  const averageScore =
    totalAttempts > 0
      ? attempts.reduce((sum, a) => sum + (a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0), 0) / totalAttempts
      : 0

  return (
    <div className='space-y-6'>
      {/* Statistics Overview */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium'>Total de Evaluaciones</CardTitle>
            <Brain className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalAttempts}</div>
            <p className='text-xs text-muted-foreground'>Evaluaciones realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium'>Tasa de Aprobación</CardTitle>
            <Trophy className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{passRate.toFixed(1)}%</div>
            <p className='text-xs text-muted-foreground'>
              {passedAttempts} de {totalAttempts} aprobadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium'>Promedio General</CardTitle>
            <Target className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{averageScore.toFixed(1)}%</div>
            <p className='text-xs text-muted-foreground'>Calificación promedio</p>
          </CardContent>
        </Card>
      </div>

      {/* Attempts List */}
      <div className='space-y-3'>
        <h2 className='text-lg font-semibold'>Historial de Evaluaciones</h2>
        {attempts.map((attempt) => {
          const scorePercentage = attempt.maxScore > 0 ? (attempt.score / attempt.maxScore) * 100 : 0
          const isExpanded = expandedAttempts.has(attempt.id)

          return (
            <Collapsible key={attempt.id} open={isExpanded} onOpenChange={() => toggleExpanded(attempt.id)}>
              <Card className={cn('transition-all', attempt.passed ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500')}>
                <CardHeader>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex-1 space-y-2'>
                      <div className='flex items-center gap-2'>
                        <CardTitle className='text-base'>{attempt.quiz.title}</CardTitle>
                        {attempt.passed ? (
                          <Badge variant='default' className='bg-green-500'>
                            <CheckCircle2 className='h-3 w-3 mr-1' />
                            Aprobado
                          </Badge>
                        ) : (
                          <Badge variant='destructive'>
                            <XCircle className='h-3 w-3 mr-1' />
                            No aprobado
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        <span className='font-medium'>{attempt.quiz.lesson.module.course.title}</span> •{' '}
                        {attempt.quiz.lesson.title}
                      </CardDescription>
                      <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                        <span className='flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          {formatDistanceToNow(new Date(attempt.startedAt), {
                            addSuffix: true,
                            locale: es
                          })}
                        </span>
                        <span>Intento #{attempt.attemptNumber}</span>
                      </div>
                    </div>

                    <div className='flex flex-col items-center gap-2'>
                      <div className='relative h-20 w-20'>
                        <svg className='transform -rotate-90 h-20 w-20'>
                          <circle
                            cx='40'
                            cy='40'
                            r='36'
                            stroke='currentColor'
                            strokeWidth='8'
                            fill='transparent'
                            className='text-muted'
                          />
                          <circle
                            cx='40'
                            cy='40'
                            r='36'
                            stroke='currentColor'
                            strokeWidth='8'
                            fill='transparent'
                            strokeDasharray={`${2 * Math.PI * 36}`}
                            strokeDashoffset={`${2 * Math.PI * 36 * (1 - scorePercentage / 100)}`}
                            className={cn(
                              'transition-all',
                              attempt.passed ? 'text-green-500' : 'text-red-500'
                            )}
                          />
                        </svg>
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <span className='text-lg font-bold'>{scorePercentage.toFixed(0)}%</span>
                        </div>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          {isExpanded ? (
                            <>
                              <ChevronUp className='h-4 w-4 mr-1' />
                              Menos
                            </>
                          ) : (
                            <>
                              <ChevronDown className='h-4 w-4 mr-1' />
                              Detalles
                            </>
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className='pt-0 space-y-4'>
                    <div className='border-t pt-4 space-y-3'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-muted-foreground'>Puntuación</span>
                        <span className='font-medium'>
                          {attempt.score} / {attempt.maxScore} puntos
                        </span>
                      </div>
                      <Progress value={scorePercentage} className='h-2' />

                      <div className='grid grid-cols-2 gap-4 pt-2'>
                        <div className='space-y-1'>
                          <p className='text-sm text-muted-foreground'>Puntuación mínima</p>
                          <p className='text-lg font-semibold'>{attempt.quiz.passingScore}%</p>
                        </div>
                        <div className='space-y-1'>
                          <p className='text-sm text-muted-foreground'>Tu puntuación</p>
                          <p
                            className={cn(
                              'text-lg font-semibold',
                              attempt.passed ? 'text-green-500' : 'text-red-500'
                            )}
                          >
                            {scorePercentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {attempt.quiz.description && (
                        <div className='pt-2 border-t'>
                          <p className='text-sm text-muted-foreground'>{attempt.quiz.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { completeQuizAttempt, startQuizAttempt } from '@/actions/quiz.actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Question {
  id: string
  text: string
  type: string
  points: number
  options: Array<{
    id: string
    text: string
    position: number
  }>
  explanation?: string
}

interface Quiz {
  id: string
  title: string
  description?: string
  instructions?: string
  durationMinutes?: number
  showAnswers: boolean
}

interface QuizViewerProps {
  quiz: Quiz
  questions: Question[]
  userId: string
  onComplete?: (result: any) => void
}

export function QuizViewer({ quiz, questions, userId, onComplete }: QuizViewerProps) {
  const [isPending, startTransition] = useTransition()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [attemptId, setAttemptId] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [stage, setStage] = useState<'intro' | 'taking' | 'completed'>('intro')

  // Timer effect
  useEffect(() => {
    if (!timeLeft || stage !== 'taking') return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev && prev <= 1) {
          return 0
        }
        return prev ? prev - 1 : null
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, stage])

  const handleStart = () => {
    startTransition(async () => {
      const result = await startQuizAttempt(userId, quiz.id)
      if (result.success) {
        setAttemptId(result.data.id)
        setStage('taking')
        if (quiz.durationMinutes) {
          setTimeLeft(quiz.durationMinutes * 60)
        }
      } else {
        setError(result.error || 'An error occurred')
      }
    })
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = () => {
    if (!attemptId) return

    startTransition(async () => {
      // Calculate score
      let score = 0
      for (const question of questions) {
        const answer = answers[question.id]
        if (answer) {
          const selectedOption = question.options.find((o) => o.id === answer)
          if (selectedOption) {
            score += question.points
          }
        }
      }

      const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
      const percentage = (score / maxScore) * 100
      const passed = percentage >= 60 // Default passing score

      const result = await completeQuizAttempt(attemptId, score, passed)

      if (result.success) {
        setStage('completed')
        onComplete?.(result.data)
      } else {
        setError(result.error || 'An error occurred')
      }
    })
  }

  const currentQuestion = questions[currentQuestionIndex]

  if (stage === 'intro') {
    return (
      <Card className='max-w-2xl mx-auto'>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
        </CardHeader>
        <CardContent className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-3 bg-muted p-4 rounded-lg'>
            <p className='font-medium'>Quiz Information:</p>
            <ul className='space-y-2 text-sm'>
              <li>• Questions: {questions.length}</li>
              <li>• Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}</li>
              {quiz.durationMinutes && <li>• Time Limit: {quiz.durationMinutes} minutes</li>}
            </ul>
          </div>

          {quiz.instructions && (
            <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
              <p className='font-medium text-blue-900 mb-2'>Instructions:</p>
              <p className='text-sm text-blue-800'>{quiz.instructions}</p>
            </div>
          )}

          <Button onClick={handleStart} disabled={isPending} className='w-full' size='lg'>
            {isPending ? 'Starting...' : 'Start Quiz'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (stage === 'taking' && currentQuestion) {
    return (
      <div className='space-y-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <div>
              <CardTitle>
                Question {currentQuestionIndex + 1} of {questions.length}
              </CardTitle>
            </div>
            {timeLeft !== null && (
              <div className={`flex items-center gap-2 text-sm font-medium ${timeLeft < 300 ? 'text-red-600' : ''}`}>
                <Clock className='h-4 w-4' />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            )}
          </CardHeader>
          <CardContent className='space-y-6'>
            <div>
              <p className='font-medium text-lg mb-2'>{currentQuestion.text}</p>
              <p className='text-sm text-muted-foreground'>
                {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
              </p>
            </div>

            <div className='space-y-3'>
              {currentQuestion.options.map((option) => (
                <div key={option.id} className='flex items-center'>
                  <input
                    type='radio'
                    id={option.id}
                    name={`question-${currentQuestion.id}`}
                    value={option.id}
                    checked={answers[currentQuestion.id] === option.id}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    disabled={isPending}
                    className='mr-3'
                  />
                  <label htmlFor={option.id} className='text-sm cursor-pointer flex-1'>
                    {option.text}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className='flex justify-between gap-3'>
          <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0 || isPending} variant='outline'>
            Previous
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={isPending} className='bg-green-600 hover:bg-green-700'>
              {isPending ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={isPending}>
              Next
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className='max-w-2xl mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-green-600'>
          <CheckCircle2 className='h-6 w-6' />
          Quiz Completed!
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Alert className='bg-green-50 border-green-200'>
          <CheckCircle2 className='h-4 w-4 text-green-600' />
          <AlertDescription className='text-green-800'>Your quiz has been submitted successfully.</AlertDescription>
        </Alert>

        <p className='text-muted-foreground'>You will see your results shortly.</p>
      </CardContent>
    </Card>
  )
}

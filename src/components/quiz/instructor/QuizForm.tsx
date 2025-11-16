'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { createQuiz, updateQuiz } from '@/actions/quiz.actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface QuizFormProps {
  lessonId: string
  initialData?: {
    id: string
    title: string
    description?: string
    instructions?: string
    durationMinutes?: number
    passingScore: number
    maxAttempts?: number
    showAnswers: boolean
    shuffleQuestions: boolean
  }
  onSuccess?: (data: any) => void
}

export function QuizForm({ lessonId, initialData, onSuccess }: QuizFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isEditing = !!initialData

  const handleSubmit = (formData: FormData) => {
    setError(null)
    setSuccess(false)
    formData.append('lessonId', lessonId)

    startTransition(async () => {
      const result = isEditing ? await updateQuiz(formData) : await createQuiz(formData)

      if (result.success) {
        setSuccess(true)
        onSuccess?.(result.data)
      } else {
        setError(result.error || 'An error occurred')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Quiz' : 'Create New Quiz'}</CardTitle>
        <CardDescription>Configure your quiz settings and general information</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className='space-y-6'>
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className='border-green-200 bg-green-50'>
              <CheckCircle2 className='h-4 w-4 text-green-600' />
              <AlertDescription className='text-green-800'>
                {isEditing ? 'Quiz updated successfully' : 'Quiz created successfully'}
              </AlertDescription>
            </Alert>
          )}

          {isEditing && <input type='hidden' name='id' value={initialData.id} />}

          <div className='space-y-2'>
            <Label htmlFor='title'>Quiz Title</Label>
            <Input
              id='title'
              name='title'
              placeholder='e.g., Chapter 1 Quiz'
              defaultValue={initialData?.title}
              required
              disabled={isPending}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              name='description'
              placeholder='Brief description of what this quiz covers'
              defaultValue={initialData?.description}
              disabled={isPending}
              rows={3}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='instructions'>Instructions</Label>
            <Textarea
              id='instructions'
              name='instructions'
              placeholder='Special instructions for students taking this quiz'
              defaultValue={initialData?.instructions}
              disabled={isPending}
              rows={3}
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='durationMinutes'>Duration (minutes)</Label>
              <Input
                id='durationMinutes'
                name='durationMinutes'
                type='number'
                placeholder='e.g., 30'
                defaultValue={initialData?.durationMinutes}
                disabled={isPending}
                min='0'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='passingScore'>Passing Score (%)</Label>
              <Input
                id='passingScore'
                name='passingScore'
                type='number'
                placeholder='e.g., 70'
                defaultValue={initialData?.passingScore ?? 60}
                disabled={isPending}
                min='0'
                max='100'
                required
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='maxAttempts'>Maximum Attempts</Label>
            <Input
              id='maxAttempts'
              name='maxAttempts'
              type='number'
              placeholder='Leave empty for unlimited'
              defaultValue={initialData?.maxAttempts}
              disabled={isPending}
              min='1'
            />
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='showAnswers'>Show Correct Answers After Completion</Label>
              <Switch
                id='showAnswers'
                name='showAnswers'
                defaultChecked={initialData?.showAnswers ?? true}
                disabled={isPending}
              />
            </div>

            <div className='flex items-center justify-between'>
              <Label htmlFor='shuffleQuestions'>Shuffle Questions</Label>
              <Switch
                id='shuffleQuestions'
                name='shuffleQuestions'
                defaultChecked={initialData?.shuffleQuestions ?? false}
                disabled={isPending}
              />
            </div>
          </div>

          <div className='flex gap-4'>
            <Button type='submit' disabled={isPending} className='flex-1'>
              {isPending ? 'Saving...' : isEditing ? 'Update Quiz' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

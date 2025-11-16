'use client'

import { Edit2, Plus, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { createQuestion, deleteQuestion, updateQuestion } from '@/actions/quiz.actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Question {
  id: string
  text: string
  explanation?: string
  type: string
  points: number
  position: number
  options: any[]
}

interface QuestionManagerProps {
  quizId: string
  questions: Question[]
  onQuestionsChange?: (questions: Question[]) => void
}

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'SINGLE_CHOICE', label: 'Single Choice' },
  { value: 'TRUE_FALSE', label: 'True/False' },
  { value: 'SHORT_ANSWER', label: 'Short Answer' },
  { value: 'LONG_ANSWER', label: 'Long Answer' },
  { value: 'ORDERING', label: 'Ordering' },
  { value: 'MATCHING', label: 'Matching' }
]

export function QuestionManager({ quizId, questions, onQuestionsChange }: QuestionManagerProps) {
  const [isPending, startTransition] = useTransition()
  const [_editingId, _setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return

    startTransition(async () => {
      const result = await deleteQuestion(questionId)
      if (!result.success) {
        setError(result.error)
      } else {
        onQuestionsChange?.(questions.filter((q) => q.id !== questionId))
      }
    })
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>Questions ({questions.length})</CardTitle>
          <CardDescription>Manage quiz questions and options</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size='sm'>
              <Plus className='h-4 w-4 mr-2' />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
              <DialogDescription>Create a new question for this quiz</DialogDescription>
            </DialogHeader>
            <QuestionForm quizId={quizId} onSuccess={() => {}} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className='space-y-4'>
        {error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {questions.length === 0 ? (
          <div className='text-center py-8 text-muted-foreground'>
            <p>No questions yet. Add your first question to get started.</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {questions.map((question, index) => (
              <Card key={question.id} className='p-4'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='text-sm font-medium text-muted-foreground'>Q{index + 1}</span>
                      <span className='inline-block px-2 py-1 text-xs font-medium bg-muted rounded'>
                        {QUESTION_TYPES.find((t) => t.value === question.type)?.label}
                      </span>
                      <span className='inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded'>
                        {question.points} pts
                      </span>
                    </div>
                    <p className='text-sm font-medium'>{question.text}</p>
                    {question.explanation && (
                      <p className='text-sm text-muted-foreground mt-1'>Explanation: {question.explanation}</p>
                    )}
                    <p className='text-xs text-muted-foreground mt-2'>{question.options?.length ?? 0} options</p>
                  </div>
                  <div className='flex gap-2'>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size='sm' variant='outline'>
                          <Edit2 className='h-4 w-4' />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Question</DialogTitle>
                        </DialogHeader>
                        <QuestionForm quizId={quizId} initialData={question} onSuccess={() => {}} />
                      </DialogContent>
                    </Dialog>
                    <Button size='sm' variant='destructive' onClick={() => handleDelete(question.id)} disabled={isPending}>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface QuestionFormProps {
  quizId: string
  initialData?: Question
  onSuccess: (data: any) => void
}

function QuestionForm({ quizId, initialData, onSuccess }: QuestionFormProps) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    formData.append('quizId', quizId)

    startTransition(async () => {
      const result = initialData ? await updateQuestion(initialData.id, formData) : await createQuestion(formData)

      if (result.success) {
        onSuccess(result.data)
      }
    })
  }

  return (
    <form action={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='text'>Question Text</Label>
        <Textarea
          id='text'
          name='text'
          placeholder='Enter the question'
          defaultValue={initialData?.text}
          required
          disabled={isPending}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='type'>Question Type</Label>
        <Select name='type' defaultValue={initialData?.type ?? 'MULTIPLE_CHOICE'} disabled={isPending}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='points'>Points</Label>
          <Input
            id='points'
            name='points'
            type='number'
            defaultValue={initialData?.points ?? 1}
            disabled={isPending}
            min='0'
            step='0.5'
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='position'>Position</Label>
          <Input
            id='position'
            name='position'
            type='number'
            defaultValue={initialData?.position ?? 0}
            disabled={isPending}
            min='0'
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='explanation'>Explanation (optional)</Label>
        <Textarea
          id='explanation'
          name='explanation'
          placeholder='Explain the correct answer'
          defaultValue={initialData?.explanation}
          disabled={isPending}
          rows={2}
        />
      </div>

      <Button type='submit' disabled={isPending} className='w-full'>
        {isPending ? 'Saving...' : initialData ? 'Update Question' : 'Create Question'}
      </Button>
    </form>
  )
}

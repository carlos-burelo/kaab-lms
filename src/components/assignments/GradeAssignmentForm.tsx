'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { gradeAssignment } from '@/actions/assignment.actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const GradeSchema = z.object({
  score: z.string().refine((val) => !Number.isNaN(parseFloat(val)), 'Debe ser un número válido'),
  feedback: z.string().optional(),
  status: z.enum(['GRADED', 'NEEDS_REVISION']).default('GRADED')
})

type GradeValues = z.infer<typeof GradeSchema>

interface GradeAssignmentFormProps {
  submission: {
    id: string
    submissionText?: string | null
    submittedAt: Date
    files: any[]
    user: {
      profile: {
        name: string
      }
    }
    assignment: {
      title: string
      maxScore: number
      dueDate: Date
    }
  }
  courseId: string
}

export function GradeAssignmentForm({ submission, courseId }: GradeAssignmentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLate = new Date(submission.submittedAt) > new Date(submission.assignment.dueDate)

  const form = useForm<GradeValues>({
    resolver: zodResolver(GradeSchema),
    defaultValues: {
      score: '',
      feedback: '',
      status: 'GRADED'
    }
  })

  async function onSubmit(data: GradeValues) {
    setIsSubmitting(true)
    try {
      const result = await gradeAssignment(submission.id, courseId, data)

      if (result.success) {
        toast({
          title: '✓ Asignación Calificada',
          description: 'La calificación ha sido guardada'
        })
        router.back()
        router.refresh()
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error
        })
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error inesperado'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Submission Details */}
      <Card>
        <CardHeader>
          <CardTitle>Entrega de {submission.user.profile.name}</CardTitle>
          <CardDescription>
            {submission.assignment.title} - Máximo: {submission.assignment.maxScore} puntos
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {isLate && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                Esta entrega fue realizada{' '}
                {Math.floor(
                  (new Date(submission.submittedAt).getTime() - new Date(submission.assignment.dueDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                días después de la fecha límite
              </AlertDescription>
            </Alert>
          )}

          {submission.submissionText && (
            <div>
              <h4 className='font-medium text-sm mb-2'>Respuesta del Estudiante:</h4>
              <div className='p-4 bg-muted rounded-lg max-h-96 overflow-y-auto'>
                <p className='text-sm whitespace-pre-wrap'>{submission.submissionText}</p>
              </div>
            </div>
          )}

          {submission.files.length > 0 && (
            <div>
              <h4 className='font-medium text-sm mb-2'>Archivos Adjuntos:</h4>
              <div className='space-y-2'>
                {submission.files.map((file) => (
                  <div key={file.id} className='flex items-center justify-between p-3 border rounded-lg'>
                    <div>
                      <p className='text-sm font-medium'>{file.filename}</p>
                      <p className='text-xs text-muted-foreground'>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button variant='outline' size='sm'>
                      <Download className='h-4 w-4 mr-2' />
                      Descargar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grading Form */}
      <Card>
        <CardHeader>
          <CardTitle>Calificar Entrega</CardTitle>
          <CardDescription>Asigna una puntuación y proporciona feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='score'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Puntuación (máximo: {submission.assignment.maxScore})</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='0' max={submission.assignment.maxScore} min='0' {...field} />
                    </FormControl>
                    <FormDescription>Ingresa la puntuación de 0 a {submission.assignment.maxScore}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='feedback'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Proporciona comentarios detallados sobre la entrega' rows={6} {...field} />
                    </FormControl>
                    <FormDescription>Este feedback será visible para el estudiante</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='GRADED'>Calificado</SelectItem>
                        <SelectItem value='NEEDS_REVISION'>Requiere Revisión</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Selecciona si la entrega está completa o requiere más trabajo</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex gap-4'>
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Calificación'}
                </Button>
                <Button type='button' variant='outline' onClick={() => router.back()}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

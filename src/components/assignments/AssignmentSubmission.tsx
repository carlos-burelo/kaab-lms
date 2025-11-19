'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { AlertCircle, CheckCircle, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { submitAssignment } from '@/actions/assignment.actions'
import { uploadFile } from '@/actions/upload-actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

const SubmissionSchema = z.object({
  submissionText: z.string().optional()
})

type SubmissionValues = z.infer<typeof SubmissionSchema>

interface AssignmentSubmissionProps {
  assignment: {
    id: string
    title: string
    description?: string | null
    instructions?: string | null
    dueDate: Date
    maxScore: number
    allowLateSubmission: boolean
    latePenaltyPercent?: number | null
  }
  courseId: string
  studentSubmission?: any
}

export function AssignmentSubmission({ assignment, courseId, studentSubmission }: AssignmentSubmissionProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>(studentSubmission?.files || [])
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<SubmissionValues>({
    resolver: zodResolver(SubmissionSchema),
    defaultValues: {
      submissionText: studentSubmission?.submissionText || ''
    }
  })

  const isOverdue = new Date() > new Date(assignment.dueDate)
  const daysOverdue = isOverdue ? Math.floor((Date.now() - new Date(assignment.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : null

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    setIsUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const result = await uploadFile(formData)
        if (result.success && result.url) {
          setUploadedFiles((prev) => [...prev, result.url as string])
        } else {
          toast.error(`No se pudo cargar ${file.name}`)
        }
      }
    } catch (_error) {
      toast.error('Ocurrió un error al cargar archivos')
    } finally {
      setIsUploading(false)
    }
  }

  function removeFile(fileId: string) {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  async function onSubmit(data: SubmissionValues) {
    setIsSubmitting(true)
    try {
      const result = await submitAssignment({
        assignmentId: assignment.id,
        courseId,
        submissionText: data.submissionText || undefined,
        fileIds: uploadedFiles.map((f) => f.id)
      })

      if (result.success) {
        toast.success('✓ Enviado: Tu asignación ha sido enviada correctamente')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch (_error) {
      toast.error('Ocurrió un error inesperado')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Assignment Details */}
      <Card>
        <CardHeader>
          <CardTitle>{assignment.title}</CardTitle>
          <CardDescription>{assignment.description}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {assignment.instructions && (
            <div className='space-y-2'>
              <h4 className='font-medium'>Instrucciones</h4>
              <p className='text-sm text-muted-foreground whitespace-pre-wrap'>{assignment.instructions}</p>
            </div>
          )}

          <div className='grid gap-4 text-sm'>
            <div>
              <p className='font-medium'>Puntuación Máxima</p>
              <p className='text-muted-foreground'>{assignment.maxScore} puntos</p>
            </div>
            <div>
              <p className='font-medium'>Fecha de Vencimiento</p>
              <p className='text-muted-foreground'>
                {new Date(assignment.dueDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {isOverdue && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                Esta asignación está vencida hace{' '}
                {(daysOverdue ?? 0) === 0 ? 'menos de 1 día' : `${daysOverdue ?? 0} día${(daysOverdue ?? 0) > 1 ? 's' : ''}`}
                {assignment.allowLateSubmission && assignment.latePenaltyPercent
                  ? `. Se aplicará una penalización del ${assignment.latePenaltyPercent}%`
                  : '. No se aceptan entregas tardías'}
              </AlertDescription>
            </Alert>
          )}

          {studentSubmission?.status === 'GRADED' && (
            <Alert>
              <CheckCircle className='h-4 w-4' />
              <AlertDescription>
                Esta asignación ha sido calificada: <strong>{studentSubmission.score} puntos</strong>
                {studentSubmission.feedback && (
                  <div className='mt-2 p-3 bg-muted rounded-md'>
                    <p className='text-sm font-medium'>Feedback del instructor:</p>
                    <p className='text-sm mt-1'>{studentSubmission.feedback}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Submission Form */}
      {!studentSubmission && (
        <Card>
          <CardHeader>
            <CardTitle>Enviar Asignación</CardTitle>
            <CardDescription>Completa y envía tu asignación antes de la fecha límite</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <FormField
                  control={form.control}
                  name='submissionText'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tu Respuesta</FormLabel>
                      <FormControl>
                        <Textarea placeholder='Escribe aquí tu respuesta o contenido de la asignación' rows={8} {...field} />
                      </FormControl>
                      <FormDescription>Puedes escribir aquí o adjuntar archivos con tu trabajo</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='space-y-4'>
                  <FormItem>
                    <FormLabel>Adjuntos</FormLabel>
                    <FormControl>
                      <div className='border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted transition-colors'>
                        <input
                          type='file'
                          multiple
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          className='hidden'
                          id='file-upload'
                          accept='.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip'
                        />
                        <label htmlFor='file-upload' className='cursor-pointer'>
                          <Upload className='h-8 w-8 mx-auto mb-2 text-muted-foreground' />
                          <p className='text-sm font-medium'>
                            {isUploading ? 'Cargando...' : 'Arrastra archivos aquí o haz clic para seleccionar'}
                          </p>
                          <p className='text-xs text-muted-foreground mt-1'>PDF, Word, Imágenes, ZIP (máx 50MB)</p>
                        </label>
                      </div>
                    </FormControl>
                  </FormItem>

                  {uploadedFiles.length > 0 && (
                    <div className='space-y-2'>
                      <p className='text-sm font-medium'>Archivos cargados:</p>
                      <div className='space-y-2'>
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className='flex items-center justify-between p-2 bg-muted rounded-md'>
                            <div className='flex-1'>
                              <p className='text-sm font-medium'>{file.filename}</p>
                              <p className='text-xs text-muted-foreground'>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <Button type='button' variant='ghost' size='sm' onClick={() => removeFile(file.id)}>
                              <X className='h-4 w-4' />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className='flex gap-4'>
                  <Button type='submit' disabled={isSubmitting || isUploading}>
                    {isSubmitting ? 'Enviando...' : 'Enviar Asignación'}
                  </Button>
                  <Button type='button' variant='outline' onClick={() => router.back()}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Graded Submission */}
      {studentSubmission?.status === 'GRADED' && (
        <Card>
          <CardHeader>
            <CardTitle>Tu Entrega</CardTitle>
            <CardDescription>
              Enviada{' '}
              {formatDistanceToNow(new Date(studentSubmission.submittedAt), {
                addSuffix: true,
                locale: es
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {studentSubmission.submissionText && (
              <div>
                <p className='font-medium text-sm mb-2'>Tu Respuesta:</p>
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>{studentSubmission.submissionText}</p>
              </div>
            )}

            {studentSubmission.files && studentSubmission.files.length > 0 && (
              <div>
                <p className='font-medium text-sm mb-2'>Archivos:</p>
                <div className='space-y-2'>
                  {studentSubmission.files.map((file: any) => (
                    <div key={file.id} className='flex items-center justify-between p-2 bg-muted rounded-md'>
                      <p className='text-sm'>{file.filename}</p>
                      <p className='text-xs text-muted-foreground'>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { createAssignment, updateAssignment } from '@/actions/assignment.actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

const AssignmentSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  dueDate: z.string().datetime('Fecha inválida'),
  maxScore: z.string().refine((val) => !Number.isNaN(parseFloat(val)), 'Debe ser un número'),
  allowLateSubmission: z.boolean().default(false),
  latePenaltyPercent: z
    .string()
    .optional()
    .refine((val) => !val || !Number.isNaN(parseFloat(val)), 'Debe ser un número')
})

type AssignmentFormValues = z.infer<typeof AssignmentSchema>

interface AssignmentFormProps {
  lessonId: string
  courseId: string
  assignmentId?: string
  initialData?: any
}

export function AssignmentForm({ lessonId, courseId, assignmentId, initialData }: AssignmentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(AssignmentSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      instructions: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxScore: '100',
      allowLateSubmission: false,
      latePenaltyPercent: '10'
    }
  })

  async function onSubmit(data: AssignmentFormValues) {
    setIsSubmitting(true)
    try {
      const result = assignmentId
        ? await updateAssignment({
            assignmentId,
            courseId,
            ...data
          })
        : await createAssignment({
            lessonId,
            courseId,
            ...data
          })

      if (result.success) {
        toast({
          title: '✓ Exitoso',
          description: assignmentId ? 'Asignación actualizada correctamente' : 'Asignación creada correctamente'
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
    <Card>
      <CardHeader>
        <CardTitle>{assignmentId ? 'Editar Asignación' : 'Nueva Asignación'}</CardTitle>
        <CardDescription>
          {assignmentId ? 'Modifica los detalles de la asignación' : 'Crea una nueva asignación para esta lección'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título de la Asignación</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej: Proyecto Final' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Descripción breve de la asignación' {...field} />
                  </FormControl>
                  <FormDescription>Visible para los estudiantes</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='instructions'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrucciones</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Instrucciones detalladas para completar la asignación' rows={5} {...field} />
                  </FormControl>
                  <FormDescription>
                    Incluye los requisitos, criterios de evaluación y cualquier otra información relevante
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dueDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha y Hora de Vencimiento</FormLabel>
                  <FormControl>
                    <Input type='datetime-local' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='maxScore'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Puntuación Máxima</FormLabel>
                  <FormControl>
                    <Input type='number' placeholder='100' {...field} />
                  </FormControl>
                  <FormDescription>Puntos máximos que se pueden obtener</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='allowLateSubmission'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel>Permitir entregas tardías</FormLabel>
                    <FormDescription>Los estudiantes pueden entregar después de la fecha límite</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('allowLateSubmission') && (
              <FormField
                control={form.control}
                name='latePenaltyPercent'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Penalización por Entrega Tardía (%)</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='10' {...field} />
                    </FormControl>
                    <FormDescription>Porcentaje de puntos que se descontarán por entrega tardía</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className='flex gap-4'>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : assignmentId ? 'Actualizar' : 'Crear'}
              </Button>
              <Button type='button' variant='outline' onClick={() => router.back()} disabled={isSubmitting}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createLearningPath } from '../../actions'

const formSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  estimatedDurationDays: z.number().optional()
})

type FormValues = z.infer<typeof formSchema>

interface NewLearningPathFormProps {
  userId: string
}

export const NewLearningPathForm: React.FC<NewLearningPathFormProps> = ({ userId }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      level: 'BEGINNER',
      estimatedDurationDays: undefined
    }
  })

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const result = await createLearningPath({
          ...values,
          instructorId: userId
        })

        if (result.success && 'id' in result) {
          toast.success('Ruta creada exitosamente')
          router.push(`/instructor/rutas-aprendizaje/${result.id}/diseñador`)
        } else {
          toast.error('error' in result ? result.error : 'Error al crear la ruta')
        }
      } catch (_error) {
        toast.error('Error al crear la ruta')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles de la Ruta</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título de la Ruta</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='ej. Introducción a JavaScript'
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        // Auto-generate slug
                        const slug = e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9-]/g, '')
                        form.setValue('slug', slug)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL)</FormLabel>
                  <FormControl>
                    <Input placeholder='introduccion-a-javascript' {...field} />
                  </FormControl>
                  <FormDescription>URL amigable para la ruta</FormDescription>
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
                    <Textarea placeholder='Describe qué aprenderán los estudiantes en esta ruta...' className='h-24' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='level'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='BEGINNER'>Principiante</SelectItem>
                        <SelectItem value='INTERMEDIATE'>Intermedio</SelectItem>
                        <SelectItem value='ADVANCED'>Avanzado</SelectItem>
                        <SelectItem value='EXPERT'>Experto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='estimatedDurationDays'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración Estimada (días)</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='30' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex gap-3'>
              <Button type='submit' disabled={isPending} className='flex-1'>
                {isPending ? 'Creando...' : 'Crear y Diseñar'}
              </Button>
              <Button type='button' variant='outline' onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

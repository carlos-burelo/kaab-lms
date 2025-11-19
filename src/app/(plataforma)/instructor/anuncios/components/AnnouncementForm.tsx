'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { createAnnouncement } from '@/actions/instructor/announcement.actions'
import { toast } from 'sonner'

const formSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  content: z.string().min(1, 'El contenido es requerido'),
  ctaLink: z.string().optional(),
  ctaText: z.string().optional(),
  placement: z.enum([
    'DASHBOARD_BANNER',
    'COURSE_BANNER',
    'GLOBAL_MODAL',
    'INLINE_FEED',
    'LOGIN_PAGE'
  ]),
  startDate: z.string(),
  endDate: z.string(),
  priority: z.coerce.number().default(0),
  targetRole: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN']).optional()
})

type FormValues = z.infer<typeof formSchema>

export function AnnouncementForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: '',
      content: '',
      ctaLink: '',
      ctaText: '',
      placement: 'DASHBOARD_BANNER',
      priority: 0
    }
  })

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const result = await createAnnouncement({
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        priority: Number(data.priority),
        targetCourseId: null
      })

      if (result.success) {
        toast.success('Anuncio creado correctamente')
        router.push('/instructor/anuncios')
      } else {
        toast.error('Error al crear el anuncio')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 max-w-2xl'>
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input {...field} placeholder='Título del anuncio' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='content'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenido</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder='Contenido del anuncio'
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='ctaText'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Texto del botón (opcional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='Ej: Saber más' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='ctaLink'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enlace del botón (opcional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder='https://...' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='placement'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Selecciona la ubicación' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='DASHBOARD_BANNER'>Banner del Dashboard</SelectItem>
                  <SelectItem value='COURSE_BANNER'>Banner del Curso</SelectItem>
                  <SelectItem value='GLOBAL_MODAL'>Modal Global</SelectItem>
                  <SelectItem value='INLINE_FEED'>Feed Inline</SelectItem>
                  <SelectItem value='LOGIN_PAGE'>Página de Login</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='startDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de inicio</FormLabel>
                <FormControl>
                  <Input {...field} type='datetime-local' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='endDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de fin</FormLabel>
                <FormControl>
                  <Input {...field} type='datetime-local' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='priority'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridad</FormLabel>
              <FormControl>
                <Input {...field} type='number' min={0} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='targetRole'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol objetivo (opcional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Todos los roles' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='STUDENT'>Estudiantes</SelectItem>
                  <SelectItem value='INSTRUCTOR'>Instructores</SelectItem>
                  <SelectItem value='ADMIN'>Administradores</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex gap-4'>
          <Button type='submit' disabled={isPending}>
            {isPending ? 'Creando...' : 'Crear Anuncio'}
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  )
}

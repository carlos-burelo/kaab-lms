'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { getInstructorProfile, updateInstructorProfile } from '@/actions/instructor/profile.actions'
import { toast } from 'sonner'

const formSchema = z.object({
  publicBio: z.string().optional(),
  certifications: z.string().optional(),
  experience: z.string().optional(),
  bankAccount: z.string().optional(),
  paypalEmail: z.string().email().optional().or(z.literal(''))
})

type FormValues = z.infer<typeof formSchema>

export function InstructorProfileForm() {
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      publicBio: '',
      certifications: '',
      experience: '',
      bankAccount: '',
      paypalEmail: ''
    }
  })

  const loadProfile = useCallback(async () => {
    const result = await getInstructorProfile()

    if (result.success && result.data) {
      const profile = result.data as any
      form.reset({
        publicBio: profile.publicBio || '',
        certifications: profile.qualifications?.certifications || '',
        experience: profile.qualifications?.experience || '',
        bankAccount: profile.payoutDetails?.bankAccount || '',
        paypalEmail: profile.payoutDetails?.paypalEmail || ''
      })
    }
    setLoading(false)
  }, [form])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const result = await updateInstructorProfile({
        publicBio: data.publicBio,
        qualifications: {
          certifications: data.certifications,
          experience: data.experience
        },
        payoutDetails: {
          bankAccount: data.bankAccount,
          paypalEmail: data.paypalEmail
        }
      })

      if (result.success) {
        toast.success('Perfil actualizado correctamente')
      } else {
        toast.error('Error al actualizar perfil')
      }
    })
  }

  if (loading) {
    return <div className='p-4'>Cargando perfil...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 max-w-4xl'>
        <Card>
          <CardHeader>
            <CardTitle>Información Pública</CardTitle>
            <CardDescription>
              Esta información será visible para los estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='publicBio'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografía Pública</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='Cuéntanos sobre ti, tu experiencia y qué te motiva a enseñar...'
                      rows={6}
                    />
                  </FormControl>
                  <FormDescription>
                    Comparte tu historia y experiencia con los estudiantes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cualificaciones</CardTitle>
            <CardDescription>
              Agrega tus certificaciones y experiencia profesional
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='certifications'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='Lista tus certificaciones, títulos y credenciales...'
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='experience'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experiencia Profesional</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='Describe tu experiencia laboral relevante...'
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Pago</CardTitle>
            <CardDescription>
              Configura cómo deseas recibir tus pagos (privado)
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='bankAccount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuenta Bancaria (CLABE)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='18 dígitos' maxLength={18} />
                  </FormControl>
                  <FormDescription>
                    Tu CLABE interbancaria para transferencias
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='paypalEmail'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de PayPal</FormLabel>
                  <FormControl>
                    <Input {...field} type='email' placeholder='tu@email.com' />
                  </FormControl>
                  <FormDescription>
                    Opcional: email asociado a tu cuenta de PayPal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type='submit' disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </form>
    </Form>
  )
}

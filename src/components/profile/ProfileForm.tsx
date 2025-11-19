'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Facebook, Github, Globe, Linkedin, Save, Twitter, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { updateProfile } from '@/actions/profile.actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

const profileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  bio: z.string().max(500, 'Máximo 500 caracteres').optional(),
  socialLinks: z
    .object({
      facebook: z.string().url('URL inválida').optional().or(z.literal('')),
      twitter: z.string().url('URL inválida').optional().or(z.literal('')),
      linkedin: z.string().url('URL inválida').optional().or(z.literal('')),
      github: z.string().url('URL inválida').optional().or(z.literal('')),
      website: z.string().url('URL inválida').optional().or(z.literal(''))
    })
    .optional()
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileFormProps {
  initialProfile: any
  userEmail: string
}

export function ProfileForm({ initialProfile, userEmail }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialProfile?.name || '',
      bio: initialProfile?.bio || '',
      socialLinks: {
        facebook: initialProfile?.socialLinks?.facebook || '',
        twitter: initialProfile?.socialLinks?.twitter || '',
        linkedin: initialProfile?.socialLinks?.linkedin || '',
        github: initialProfile?.socialLinks?.github || '',
        website: initialProfile?.socialLinks?.website || ''
      }
    }
  })

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true)
    const result = await updateProfile(data)

    if (result.success) {
      toast({
        title: 'Perfil actualizado',
        description: 'Tu perfil ha sido actualizado correctamente'
      })
      router.refresh()
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Error al actualizar perfil',
        variant: 'destructive'
      })
    }
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Actualiza tu información de perfil</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center gap-6'>
            <Avatar className='h-24 w-24'>
              <AvatarImage src={initialProfile?.imageUrl || ''} />
              <AvatarFallback>
                <User className='h-12 w-12' />
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <Label>Email</Label>
              <Input value={userEmail} disabled className='mt-2' />
              <p className='text-xs text-muted-foreground mt-1'>El email no se puede cambiar</p>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='name'>Nombre completo *</Label>
            <Input id='name' placeholder='Tu nombre completo' {...register('name')} />
            {errors.name && <p className='text-sm text-destructive'>{errors.name.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='bio'>Biografía</Label>
            <Textarea id='bio' placeholder='Cuéntanos sobre ti...' rows={4} {...register('bio')} className='resize-none' />
            {errors.bio && <p className='text-sm text-destructive'>{errors.bio.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Redes Sociales</CardTitle>
          <CardDescription>Enlaces a tus perfiles en redes sociales (opcional)</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='facebook' className='flex items-center gap-2'>
              <Facebook className='h-4 w-4' />
              Facebook
            </Label>
            <Input id='facebook' placeholder='https://facebook.com/tu-perfil' {...register('socialLinks.facebook')} />
            {errors.socialLinks?.facebook && <p className='text-sm text-destructive'>{errors.socialLinks.facebook.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='twitter' className='flex items-center gap-2'>
              <Twitter className='h-4 w-4' />
              Twitter
            </Label>
            <Input id='twitter' placeholder='https://twitter.com/tu-perfil' {...register('socialLinks.twitter')} />
            {errors.socialLinks?.twitter && <p className='text-sm text-destructive'>{errors.socialLinks.twitter.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='linkedin' className='flex items-center gap-2'>
              <Linkedin className='h-4 w-4' />
              LinkedIn
            </Label>
            <Input id='linkedin' placeholder='https://linkedin.com/in/tu-perfil' {...register('socialLinks.linkedin')} />
            {errors.socialLinks?.linkedin && <p className='text-sm text-destructive'>{errors.socialLinks.linkedin.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='github' className='flex items-center gap-2'>
              <Github className='h-4 w-4' />
              GitHub
            </Label>
            <Input id='github' placeholder='https://github.com/tu-usuario' {...register('socialLinks.github')} />
            {errors.socialLinks?.github && <p className='text-sm text-destructive'>{errors.socialLinks.github.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='website' className='flex items-center gap-2'>
              <Globe className='h-4 w-4' />
              Sitio Web
            </Label>
            <Input id='website' placeholder='https://tu-sitio.com' {...register('socialLinks.website')} />
            {errors.socialLinks?.website && <p className='text-sm text-destructive'>{errors.socialLinks.website.message}</p>}
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-end'>
        <Button type='submit' disabled={isLoading}>
          <Save className='h-4 w-4 mr-2' />
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  )
}

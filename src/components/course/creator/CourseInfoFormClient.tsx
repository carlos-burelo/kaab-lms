'use client'

import { CourseLevel } from '@prisma/client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CourseValidationAlert } from './CourseValidationAlert'
import { ImageUploader } from './ImageUploader'
import type { CourseForm } from './types'

interface CourseInfoFormClientProps extends CourseForm {
  categories: Array<{ id: string; name: string }>
  action: (formData: FormData) => void
}

export function CourseInfoFormClient({ course, categories, action }: CourseInfoFormClientProps) {
  const [imagenId, setImagenId] = useState<string>(course?.image?.id || '')

  // Calcular progreso
  const progressItems = [
    { label: 'Título', completed: !!course?.title?.trim() },
    { label: 'Descripción', completed: !!course?.description?.trim() },
    { label: 'Categoría', completed: !!course?.categoryId },
    { label: 'Nivel', completed: !!course?.level }
  ]

  const completado = progressItems.filter((item) => item.completed).length

  const handleSubmit = async (formData: FormData) => {
    // Agregar ID de imagen si existe
    if (imagenId) {
      formData.append('imageId', imagenId)
    }
    await action(formData)
  }

  return (
    <form action={handleSubmit} className='w-full p-4'>
      <input type='hidden' name='id' value={course?.id || ''} />

      <div className='max-w-6xl mx-auto'>
        {course && <CourseValidationAlert course={course} />}

        {course && (
          <Card className='mb-6 p-4'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='font-semibold text-sm'>Información Básica</h3>
              <span className='text-xs text-muted-foreground'>
                {completado}/{progressItems.length} completado
              </span>
            </div>
            <div className='w-full bg-secondary rounded-full h-2'>
              <div
                className='bg-primary h-2 rounded-full transition-all duration-300'
                style={{ width: `${(completado / progressItems.length) * 100}%` }}
              />
            </div>
          </Card>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-1'>
            <Card className='p-6 h-full flex flex-col'>
              <h2 className='font-semibold text-base mb-4'>Vista Previa</h2>
              <ImageUploader label='Imagen del curso' currentImage={course?.image?.url} onImageUpload={setImagenId} />
            </Card>
          </div>

          <div className='lg:col-span-2'>
            <Card className='p-6'>
              <div className='space-y-5'>
                <div>
                  <h3 className='font-semibold text-base mb-4 pb-2 border-b'>Información General</h3>
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='title'>Título del curso *</Label>
                      <Input
                        id='title'
                        name='title'
                        required
                        defaultValue={course?.title}
                        placeholder='Ej: Introducción a React y Next.js'
                        className='mt-1.5'
                      />
                    </div>

                    <div>
                      <Label htmlFor='description'>Descripción</Label>
                      <Textarea
                        id='description'
                        name='description'
                        defaultValue={course?.description || ''}
                        placeholder='Describe de qué trata tu curso...'
                        rows={4}
                        className='mt-1.5'
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className='font-semibold text-base mb-4 pb-2 border-b'>Categorización</h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='level'>Nivel</Label>
                      <Select name='level' defaultValue={course?.level || ''}>
                        <SelectTrigger className='mt-1.5 w-full'>
                          <SelectValue placeholder='Selecciona un nivel' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={CourseLevel.BEGINNER}>Principiante</SelectItem>
                          <SelectItem value={CourseLevel.INTERMEDIATE}>Intermedio</SelectItem>
                          <SelectItem value={CourseLevel.ADVANCED}>Avanzado</SelectItem>
                          <SelectItem value={CourseLevel.EXPERT}>Experto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor='categoryId'>Categoría</Label>
                      <Select name='categoryId' defaultValue={course?.categoryId || ''}>
                        <SelectTrigger className='mt-1.5 w-full'>
                          <SelectValue placeholder='Selecciona una categoría' />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <h3 className='font-semibold text-sm mb-3 pb-2 border-b'>Requisitos</h3>
                    <Label htmlFor='requirements' className='text-xs'>
                      Uno por línea
                    </Label>
                    <Textarea
                      id='requirements'
                      name='requirements'
                      defaultValue={course?.requirements ? (course.requirements as string[]).join('\n') : ''}
                      placeholder='Conocimientos básicos de JavaScript&#10;Experiencia con HTML y CSS'
                      rows={4}
                      className='mt-2 text-sm'
                    />
                  </div>

                  <div>
                    <h3 className='font-semibold text-sm mb-3 pb-2 border-b'>Objetivos de Aprendizaje</h3>
                    <Label htmlFor='objectives' className='text-xs'>
                      Uno por línea
                    </Label>
                    <Textarea
                      id='objectives'
                      name='objectives'
                      defaultValue={course?.objectives ? (course.objectives as string[]).join('\n') : ''}
                      placeholder='Crear aplicaciones web con React&#10;Entender el funcionamiento de hooks&#10;Implementar enrutamiento con React Router'
                      rows={4}
                      className='mt-2 text-sm'
                    />
                  </div>
                </div>
                <div className='flex justify-end pt-4 border-t'>
                  <Button size='lg' type='submit'>
                    {course ? 'Guardar y continuar' : 'Crear curso'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </form>
  )
}

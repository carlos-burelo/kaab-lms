'use client'

import { AlertCircle, Book, CheckCircle2, Clock, DollarSign, Eye, Info, Timer, Users } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { publishCourse, unpublishCourse, updateCourseBasicInfo } from '@/actions/courseActions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { DetallesDelCurso } from './types'

interface PublishCourseFormProps {
  course: DetallesDelCurso | null
}

export function PublishCourseForm({ course }: PublishCourseFormProps) {
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'resumen' | 'precios' | 'preview'>('resumen')
  const [price, setPrice] = useState<string>(course?.price?.toString() || '')
  const [discountPrice, setDiscountPrice] = useState<string>(course?.discountPrice?.toString() || '')
  const [durationMinutes, setDurationMinutes] = useState<string>(course?.durationMinutes?.toString() || '')

  if (!course) {
    return (
      <div className='max-w-2xl mx-auto p-8'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>El curso no se encontró</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Calcular estadísticas
  const totalModulos = course.modules.length
  const totalLecciones = course.modules.reduce((acc: number, m: any) => acc + m.lessons.length, 0)
  const totalContenido = course.modules.reduce((acc: number, m: any) => {
    return acc + m.lessons.reduce((acc2: number, l: any) => acc2 + l.contents.length, 0)
  }, 0)

  // Validaciones
  const validaciones = {
    titulo: { pasada: !!course.title?.trim(), mensaje: 'Título del curso' },
    descripcion: { pasada: !!course.description?.trim(), mensaje: 'Descripción del curso' },
    categoria: { pasada: !!course.categoryId, mensaje: 'Categoría del curso' },
    nivel: { pasada: !!course.level, mensaje: 'Nivel del curso' },
    modulos: { pasada: totalModulos > 0, mensaje: 'Al menos un módulo' },
    lecciones: {
      pasada: course.modules.every((m: any) => m.lessons.length > 0),
      mensaje: 'Cada módulo debe tener al menos una lección'
    },
    contenido: {
      pasada: course.modules.every((m: any) => m.lessons.every((l: any) => l.contents.length > 0)),
      mensaje: 'Cada lección debe tener contenido'
    }
  }

  const todasLasValidacionesPasan = Object.values(validaciones).every((v) => v.pasada)

  const handlePublish = () => {
    if (!todasLasValidacionesPasan) {
      toast.error('Debes completar todos los requisitos antes de publicar')
      return
    }

    startTransition(async () => {
      toast.promise(publishCourse(course.id), {
        loading: 'Publicando curso...',
        success: 'Curso publicado correctamente',
        error: (err) => (err instanceof Error ? err.message : 'Error al publicar')
      })
    })
  }

  const handleUnpublish = () => {
    if (!confirm('¿Estás seguro de que quieres despublicar el curso? Los estudiantes no podrán verlo.')) {
      return
    }

    startTransition(async () => {
      toast.promise(unpublishCourse(course.id), {
        loading: 'Despublicando curso...',
        success: 'Curso despublicado correctamente',
        error: (err) => (err instanceof Error ? err.message : 'Error al despublicar')
      })
    })
  }

  // Validaciones de precio y duración
  const priceNum = price ? parseFloat(price) : null
  const discountPriceNum = discountPrice ? parseFloat(discountPrice) : null
  const durationNum = durationMinutes ? parseInt(durationMinutes, 10) : null

  const priceErrors = []
  if (price && Number.isNaN(priceNum!)) priceErrors.push('Precio inválido')
  if (price && priceNum! < 0) priceErrors.push('Precio no puede ser negativo')
  if (discountPrice && Number.isNaN(discountPriceNum!)) priceErrors.push('Precio con descuento inválido')
  if (discountPrice && discountPriceNum! < 0) priceErrors.push('Precio con descuento no puede ser negativo')
  if (price && discountPrice && discountPriceNum! >= priceNum!) {
    priceErrors.push('Precio con descuento debe ser menor que el precio normal')
  }
  if (durationMinutes && Number.isNaN(durationNum!)) priceErrors.push('Duración inválida')
  if (durationMinutes && durationNum! < 0) priceErrors.push('Duración no puede ser negativa')

  const hasErrors = priceErrors.length > 0
  const isSavingDisabled = isPending || hasErrors

  const handleSavePricingInfo = async () => {
    if (hasErrors) {
      toast.error('Por favor, corrige los errores antes de guardar')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('id', course.id)
      formData.append('price', price)
      formData.append('discountPrice', discountPrice)
      formData.append('durationMinutes', durationMinutes)

      const result = await updateCourseBasicInfo(formData)

      if (result.success) {
        toast.success('Información de precios guardada correctamente')
      } else {
        toast.error(result.error || 'Error al guardar')
      }
    })
  }

  return (
    <div className='max-w-4xl mx-auto p-8'>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'resumen' | 'precios' | 'preview')} className='w-full'>
        <TabsList className='grid w-full grid-cols-3 mb-6'>
          <TabsTrigger value='resumen' className='flex items-center gap-2'>
            <Info className='w-4 h-4' />
            <span className='hidden sm:inline'>Requisitos</span>
          </TabsTrigger>
          <TabsTrigger value='precios' className='flex items-center gap-2'>
            <DollarSign className='w-4 h-4' />
            <span className='hidden sm:inline'>Precios</span>
          </TabsTrigger>
          <TabsTrigger value='preview' className='flex items-center gap-2'>
            <Eye className='w-4 h-4' />
            <span className='hidden sm:inline'>Vista Previa</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='resumen' className='space-y-6'>
          {/* Estado actual */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                {course.isPublished ? (
                  <>
                    <CheckCircle2 className='w-5 h-5 text-green-600' />
                    Curso Publicado
                  </>
                ) : (
                  <>
                    <Clock className='w-5 h-5 text-amber-600' />
                    Curso en Borrador
                  </>
                )}
              </CardTitle>
              <CardDescription>Estado actual del curso</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-3 gap-4'>
                <div className='p-3 bg-secondary rounded-lg text-center'>
                  <div className='text-2xl font-bold'>{totalModulos}</div>
                  <div className='text-sm text-muted-foreground'>Módulos</div>
                </div>
                <div className='p-3 bg-secondary rounded-lg text-center'>
                  <div className='text-2xl font-bold'>{totalLecciones}</div>
                  <div className='text-sm text-muted-foreground'>Lecciones</div>
                </div>
                <div className='p-3 bg-secondary rounded-lg text-center'>
                  <div className='text-2xl font-bold'>{totalContenido}</div>
                  <div className='text-sm text-muted-foreground'>Elementos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requisitos */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Info className='w-5 h-5' />
                Requisitos para Publicar
              </CardTitle>
              <CardDescription>Completa todos los requisitos antes de publicar tu curso</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-3'>
                {Object.entries(validaciones).map(([key, { pasada, mensaje }]) => (
                  <li key={key} className='flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition'>
                    {pasada ? (
                      <CheckCircle2 className='w-5 h-5 text-green-600 shrink-0' />
                    ) : (
                      <AlertCircle className='w-5 h-5 text-amber-600 shrink-0' />
                    )}
                    <span className={pasada ? 'text-sm font-medium' : 'text-sm font-medium text-amber-600'}>{mensaje}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Información */}
          {!todasLasValidacionesPasan && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>No puedes publicar el curso</AlertTitle>
              <AlertDescription>Por favor, completa todos los requisitos antes de publicar.</AlertDescription>
            </Alert>
          )}

          {todasLasValidacionesPasan && !course.isPublished && (
            <Alert className='border-green-200 bg-green-50'>
              <CheckCircle2 className='h-4 w-4 text-green-600' />
              <AlertTitle className='text-green-900'>¡Listo para publicar!</AlertTitle>
              <AlertDescription className='text-green-800'>
                Tu curso cumple con todos los requisitos y está listo para ser publicado.
              </AlertDescription>
            </Alert>
          )}

          {course.isPublished && (
            <Alert className='border-green-200 bg-green-50'>
              <CheckCircle2 className='h-4 w-4 text-green-600' />
              <AlertTitle className='text-green-900'>Curso Publicado</AlertTitle>
              <AlertDescription className='text-green-800'>
                Tu curso es visible para los estudiantes. Puedes despublicarlo en cualquier momento.
              </AlertDescription>
            </Alert>
          )}

          {/* Botones de acción */}
          <div className='flex gap-3 justify-end'>
            {course.isPublished ? (
              <Button onClick={handleUnpublish} disabled={isPending} variant='destructive' size='lg'>
                Despublicar Curso
              </Button>
            ) : (
              <Button onClick={handlePublish} disabled={isPending || !todasLasValidacionesPasan} size='lg'>
                {isPending ? (
                  <span className='flex items-center gap-2'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white' />
                    Publicando...
                  </span>
                ) : (
                  'Publicar Curso'
                )}
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value='precios' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <DollarSign className='w-5 h-5' />
                Información de Precios y Duración
              </CardTitle>
              <CardDescription>Configura el precio y duración estimada del curso</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {/* Precio base */}
                <div className='space-y-2'>
                  <Label htmlFor='price'>Precio Base (MXN) *</Label>
                  <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground'>$</span>
                    <Input
                      id='price'
                      type='number'
                      min='0'
                      step='0.01'
                      placeholder='0.00'
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={`flex-1 ${price && Number.isNaN(priceNum!) ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <p className='text-xs text-muted-foreground'>Precio normal del curso</p>
                  {price && Number.isNaN(priceNum!) && <p className='text-xs text-red-500 font-medium'>Número inválido</p>}
                  {price && priceNum! < 0 && <p className='text-xs text-red-500 font-medium'>No puede ser negativo</p>}
                </div>

                {/* Precio con descuento */}
                <div className='space-y-2'>
                  <Label htmlFor='discountPrice'>Precio con Descuento (MXN)</Label>
                  <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground'>$</span>
                    <Input
                      id='discountPrice'
                      type='number'
                      min='0'
                      step='0.01'
                      placeholder='0.00'
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      className={`flex-1 ${
                        discountPrice && (Number.isNaN(discountPriceNum!) || (price && discountPriceNum! >= priceNum!))
                          ? 'border-red-500'
                          : ''
                      }`}
                    />
                  </div>
                  <p className='text-xs text-muted-foreground'>Opcional: Precio con descuento</p>
                  {discountPrice && Number.isNaN(discountPriceNum!) && (
                    <p className='text-xs text-red-500 font-medium'>Número inválido</p>
                  )}
                  {discountPrice && discountPriceNum! < 0 && (
                    <p className='text-xs text-red-500 font-medium'>No puede ser negativo</p>
                  )}
                  {price && discountPrice && discountPriceNum! >= priceNum! && (
                    <p className='text-xs text-red-500 font-medium'>Debe ser menor que precio normal</p>
                  )}
                </div>

                {/* Duración en minutos */}
                <div className='space-y-2'>
                  <Label htmlFor='durationMinutes'>Duración Estimada (minutos)</Label>
                  <div className='flex items-center gap-2'>
                    <Timer className='w-4 h-4 text-muted-foreground' />
                    <Input
                      id='durationMinutes'
                      type='number'
                      min='0'
                      placeholder='0'
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className={`flex-1 ${durationMinutes && Number.isNaN(durationNum!) ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <p className='text-xs text-muted-foreground'>Tiempo total estimado</p>
                  {durationMinutes && Number.isNaN(durationNum!) && (
                    <p className='text-xs text-red-500 font-medium'>Número inválido</p>
                  )}
                  {durationMinutes && durationNum! < 0 && (
                    <p className='text-xs text-red-500 font-medium'>No puede ser negativo</p>
                  )}
                </div>
              </div>

              {/* Mostrar errores */}
              {hasErrors && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertTitle>Errores de validación</AlertTitle>
                  <AlertDescription>
                    <ul className='list-disc list-inside mt-2 space-y-1'>
                      {priceErrors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Resumen de precios - solo si no hay errores */}
              {(price || discountPrice) && !hasErrors && (
                <div className='bg-secondary/50 p-4 rounded-lg space-y-2'>
                  <h4 className='font-semibold text-sm'>Resumen</h4>
                  {price && priceNum! >= 0 && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Precio normal:</span>
                      <span className='font-medium'>${priceNum!.toFixed(2)}</span>
                    </div>
                  )}
                  {discountPrice && discountPriceNum! >= 0 && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Precio con descuento:</span>
                      <span className='font-medium text-green-600'>${discountPriceNum!.toFixed(2)}</span>
                    </div>
                  )}
                  {price && discountPrice && priceNum! > 0 && discountPriceNum! >= 0 && discountPriceNum! < priceNum! && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Ahorro:</span>
                      <span className='font-medium text-green-600'>
                        ${(priceNum! - discountPriceNum!).toFixed(2)} ({((1 - discountPriceNum! / priceNum!) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  )}
                  {durationMinutes && durationNum! >= 0 && (
                    <div className='flex justify-between text-sm pt-2 border-t'>
                      <span className='text-muted-foreground'>Duración:</span>
                      <span className='font-medium'>
                        {Math.floor(durationNum! / 60)}h {durationNum! % 60}m
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Botón guardar */}
              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setActiveTab('resumen')} disabled={isPending}>
                  Volver
                </Button>
                <Button onClick={handleSavePricingInfo} disabled={isSavingDisabled}>
                  {isPending ? (
                    <span className='flex items-center gap-2'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white' />
                      Guardando...
                    </span>
                  ) : hasErrors ? (
                    'Corrige los errores'
                  ) : (
                    'Guardar Información'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='preview' className='space-y-6'>
          {/* Vista Previa */}
          <Card>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>{course.category?.name}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Descripción */}
              <div>
                <h3 className='font-semibold mb-2'>Descripción</h3>
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>{course.description}</p>
              </div>

              {/* Metadata */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='flex items-center gap-2'>
                  <Book className='w-4 h-4 text-muted-foreground' />
                  <div>
                    <p className='text-xs text-muted-foreground'>Nivel</p>
                    <p className='font-semibold text-sm'>{course.level}</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Users className='w-4 h-4 text-muted-foreground' />
                  <div>
                    <p className='text-xs text-muted-foreground'>Módulos</p>
                    <p className='font-semibold text-sm'>{totalModulos}</p>
                  </div>
                </div>
                {course.durationMinutes && (
                  <div className='flex items-center gap-2'>
                    <Timer className='w-4 h-4 text-muted-foreground' />
                    <div>
                      <p className='text-xs text-muted-foreground'>Duración</p>
                      <p className='font-semibold text-sm'>
                        {Math.floor(course.durationMinutes / 60)}h {course.durationMinutes % 60}m
                      </p>
                    </div>
                  </div>
                )}
                {course.price && (
                  <div className='flex items-center gap-2'>
                    <DollarSign className='w-4 h-4 text-muted-foreground' />
                    <div>
                      <p className='text-xs text-muted-foreground'>Precio</p>
                      <p className='font-semibold text-sm'>${parseFloat(course.price.toString()).toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Requisitos */}
              {course.requirements && Array.isArray(course.requirements) && course.requirements.length > 0 && (
                <div>
                  <h3 className='font-semibold mb-2'>Requisitos</h3>
                  <ul className='space-y-1'>
                    {(course.requirements as string[]).map((req, i) => (
                      <li key={i} className='text-sm text-muted-foreground flex items-start gap-2'>
                        <span className='text-primary mt-1'>•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Objetivos */}
              {course.objectives && Array.isArray(course.objectives) && course.objectives.length > 0 && (
                <div>
                  <h3 className='font-semibold mb-2'>Objetivos de Aprendizaje</h3>
                  <ul className='space-y-1'>
                    {(course.objectives as string[]).map((obj, i) => (
                      <li key={i} className='text-sm text-muted-foreground flex items-start gap-2'>
                        <CheckCircle2 className='w-4 h-4 text-green-600 mt-0.5 shrink-0' />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Estructura de módulos */}
              <div>
                <h3 className='font-semibold mb-4'>Estructura del Curso</h3>
                <div className='space-y-3'>
                  {course.modules.map((modulo: any, mIdx: number) => (
                    <div key={modulo.id} className='border rounded-lg p-3'>
                      <p className='font-semibold text-sm mb-2'>
                        Módulo {mIdx + 1}: {modulo.title}
                      </p>
                      <ul className='space-y-1 ml-4'>
                        {modulo.lessons.map((leccion: any, lIdx: number) => (
                          <li key={leccion.id} className='text-sm text-muted-foreground flex items-start gap-2'>
                            <span className='text-primary'>→</span>
                            <span>
                              {lIdx + 1}. {leccion.title}
                              <span className='text-xs text-muted-foreground ml-2'>({leccion.contents.length} elementos)</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

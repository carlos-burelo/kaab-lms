'use client'
import { Download, Loader2, Power, Trash2 } from 'lucide-react'
import { type FormEvent, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { eliminarPlantilla, generarCertificado, togglePlantillaEstado } from '../actions'

interface PlantillaPreviewClientProps {
  plantilla: {
    id: string
    name: string
    description: string | null
    isActive: boolean
    variables: any
    file: {
      name: string
    }
    createdAt: Date
    updatedAt: Date
  }
  cursos: {
    id: string
    title: string
  }[]
}
export function PlantillaPreviewClient({ plantilla, cursos }: PlantillaPreviewClientProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedCursoId, setSelectedCursoId] = useState<string | undefined>()
  const handleGenerarCertificado = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    if (!selectedCursoId) {
      toast.error('Por favor, selecciona un curso.')
      return
    }
    formData.append('cursoId', selectedCursoId)
    startTransition(async () => {
      try {
        const response = await generarCertificado(formData)
        if (response.success && response.pdfUrl) {
          toast.success('¡Certificado generado con éxito!')
          window.open(response.pdfUrl, '_blank')
        } else {
          toast.error(response.error || 'No se pudo generar el certificado.')
        }
      } catch (error) {
        toast.error('Error inesperado al generar el certificado.')
        console.error(error)
      }
    })
  }
  return (
    <div className='grid'>
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <CardTitle className='text-2xl'>{plantilla.name}</CardTitle>
              {plantilla.description && <CardDescription className='mt-2'>{plantilla.description}</CardDescription>}
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant={plantilla.isActive ? 'default' : 'secondary'}>{plantilla.isActive ? 'Activa' : 'Inactiva'}</Badge>
              {}
              <form action={togglePlantillaEstado as any}>
                <input type='hidden' name='id' value={plantilla.id} />
                <Button type='submit' variant='outline' size='icon' title={plantilla.isActive ? 'Desactivar' : 'Activar'}>
                  <Power className='h-4 w-4' />
                </Button>
              </form>
              <form action={eliminarPlantilla as any}>
                <input type='hidden' name='id' value={plantilla.id} />
                <Button type='submit' variant='outline' size='icon' title='Eliminar'>
                  <Trash2 className='h-4 w-4' />
                </Button>
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerarCertificado} className='space-y-4'>
            <input type='hidden' name='plantillaId' value={plantilla.id} />
            <div className='grid gap-4 grid-cols-3'>
              <div className='space-y-2'>
                <Label htmlFor='cursoId'>Selecciona un Curso</Label>
                <Select name='cursoId' onValueChange={setSelectedCursoId} required>
                  <SelectTrigger className='mt-1.5 w-full'>
                    <SelectValue placeholder='Selecciona un curso' />
                  </SelectTrigger>
                  <SelectContent>
                    {cursos.map((curso) => (
                      <SelectItem key={curso.id} value={curso.id}>
                        {curso.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(plantilla.variables as string[]).map((variable) => (
                <div key={variable} className='space-y-2'>
                  <Label htmlFor={variable} className='capitalize'>
                    {variable}
                  </Label>
                  <Input id={variable} name={variable} placeholder={`Ingresa ${variable}...`} required />
                </div>
              ))}
            </div>
            <Button type='submit' className='w-full' disabled={isPending}>
              {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Download className='mr-2 h-4 w-4' />}
              {isPending ? 'Generando...' : 'Generar Certificado PDF'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

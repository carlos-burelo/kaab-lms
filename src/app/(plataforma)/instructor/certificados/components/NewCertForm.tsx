'use client'

import { CheckCircle2, FileText, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { crearPlantilla } from '../actions'

export function NuevaPlantillaForm() {
  const router = useRouter()
  const [archivo, setArchivo] = useState<File | null>(null)
  const [variables, setVariables] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const handleArchivoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setArchivo(file)
    setProcesando(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const PizZip = (await import('pizzip')).default
      const zip = new PizZip(buffer)
      const documentXml = zip.file('word/document.xml')?.asText()
      if (documentXml) {
        const regex = /\{\{(\w+)\}\}/g
        const matches = documentXml.matchAll(regex)
        const foundVariables = new Set<string>()
        for (const match of matches) {
          foundVariables.add(match[1])
        }
        setVariables(Array.from(foundVariables))
      }
    } catch {
      alert('Error al procesar el archivo. Asegúrate de que sea un archivo .docx válido')
    } finally {
      setProcesando(false)
    }
  }
  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    try {
      formData.append('variables', JSON.stringify(variables))
      const result = await crearPlantilla(formData)
      if (result.success) {
        router.push('/instructor/certificados')
      } else {
        alert(result.error || 'Error al crear la plantilla')
      }
    } catch (error) {
      alert(`Error al crear la plantilla: ${JSON.stringify(error)}`)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Nueva Plantilla</CardTitle>
        <CardDescription>
          Sube un archivo Word (.docx) con variables en formato {'{'}
          {'{'} variable {'}'}
          {'}'} y se detectarán automáticamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='nombre'>Nombre de la Plantilla</Label>
            <Input id='nombre' name='nombre' placeholder='Ej: Certificado de Finalización' required />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='descripcion'>Descripción (opcional)</Label>
            <Textarea id='descripcion' name='descripcion' placeholder='Describe el propósito de esta plantilla...' rows={3} />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='archivo'>Archivo Word (.docx)</Label>
            <div className='flex items-center gap-4'>
              <Input
                id='archivo'
                name='archivo'
                type='file'
                accept='.docx'
                required
                onChange={handleArchivoChange}
                className='flex-1'
              />
              {archivo && (
                <Badge variant='secondary' className='gap-2'>
                  <FileText className='h-3 w-3' />
                  {archivo.name}
                </Badge>
              )}
            </div>
            <p className='text-sm text-muted-foreground'>
              Usa la sintaxis {'{'}
              {'{'} nombreVariable {'}'}
              {'}'} en tu documento Word para definir variables
            </p>
          </div>

          {procesando && (
            <div className='rounded-lg border border-border bg-muted/30 p-4'>
              <p className='text-sm text-muted-foreground'>Procesando archivo y detectando variables...</p>
            </div>
          )}

          {!procesando && variables.length > 0 && (
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <CheckCircle2 className='h-4 w-4 text-green-600' />
                <Label>Variables Detectadas</Label>
              </div>
              <div className='flex flex-wrap gap-2 rounded-lg border border-border bg-muted/30 p-4'>
                {variables.map((variable) => (
                  <Badge key={variable} variant='secondary'>
                    {'{'}
                    {'{'} {variable} {'}'}
                    {'}'}
                  </Badge>
                ))}
              </div>
              <p className='text-sm text-muted-foreground'>
                Se encontraron {variables.length} variable{variables.length !== 1 ? 's' : ''} en el documento
              </p>
            </div>
          )}

          {!procesando && archivo && variables.length === 0 && (
            <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
              <p className='text-sm text-yellow-800'>
                No se detectaron variables en el documento. Asegúrate de usar la sintaxis {'{'}
                {'{'} nombreVariable {'}'}
                {'}'}
              </p>
            </div>
          )}

          <div className='flex gap-4'>
            <Button type='submit' disabled={loading || !archivo || procesando} className='flex-1'>
              <Upload className='mr-2 h-4 w-4' />
              {loading ? 'Creando...' : 'Crear Plantilla'}
            </Button>
            <Button type='button' variant='outline' onClick={() => router.push('/instructor/certificados')} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

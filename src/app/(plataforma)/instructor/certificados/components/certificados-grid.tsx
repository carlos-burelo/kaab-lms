import { Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getMyCertificateTemplates } from '../actions'

export async function CertificatesGrig() {
  const plantillas = await getMyCertificateTemplates()

  if (plantillas.length === 0) {
    return (
      <div className='flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center'>
        <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
          <Eye className='h-8 w-8 text-muted-foreground' />
        </div>
        <h3 className='mb-2 text-xl font-semibold text-foreground'>No hay plantillas disponibles</h3>
        <p className='mb-6 text-muted-foreground'>Comienza creando tu primera plantilla de certificado</p>
        <Link href='/instructor/certificados/nuevo'>
          <Button>Crear Primera Plantilla</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {plantillas.map((plantilla) => (
        <Link key={plantilla.id} href={`/instructor/certificados/${plantilla.id}`}>
          <Card className='flex h-full cursor-pointer flex-col transition-all hover:border-primary hover:shadow-lg'>
            <CardHeader>
              <Image
                src={'/fallback-course.svg'}
                alt={plantilla.name}
                width={400}
                height={200}
                className='mb-4 h-32 w-full object-cover rounded-md'
              />

              <div className='flex items-start justify-between'>
                <CardTitle className='text-lg'>{plantilla.name}</CardTitle>
                <Badge variant={plantilla.isActive ? 'default' : 'secondary'}>{plantilla.isActive ? 'Activa' : 'Inactiva'}</Badge>
              </div>
              {plantilla.description && <CardDescription className='line-clamp-2'>{plantilla.description}</CardDescription>}
            </CardHeader>
            <CardContent className='flex-1'>
              <div className='space-y-2 text-sm'>
                <div className='text-muted-foreground'>Creada: {new Date(plantilla.createdAt).toLocaleDateString('es-ES')}</div>
              </div>
            </CardContent>
            <CardFooter className='text-sm text-muted-foreground'>
              <Eye className='mr-2 h-4 w-4' />
              Haz clic para ver y generar certificados
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}

'use client'

import type { Prisma } from '@prisma/client'
import { BadgeCheckIcon, DownloadIcon, ExternalLinkIcon, CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type CertificateWithRelations = Prisma.CertificateGetPayload<{
  include: {
    course: true
    template: true
    file: true
  }
}>

interface CertificatesListProps {
  certificates: CertificateWithRelations[]
}

export function CertificatesList({ certificates }: CertificatesListProps) {
  const sortedCertificates = [...certificates].sort((a, b) => {
    const dateA = new Date(a.issuedAt || 0).getTime()
    const dateB = new Date(b.issuedAt || 0).getTime()
    return dateB - dateA
  })

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <p className='text-sm text-muted-foreground'>
            Total de certificados: <span className='font-semibold text-foreground'>{certificates.length}</span>
          </p>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {sortedCertificates.map((certificate) => (
          <CertificateCard key={certificate.id} certificate={certificate} />
        ))}
      </div>
    </div>
  )
}

function CertificateCard({ certificate }: { certificate: CertificateWithRelations }) {
  const { course } = certificate
  const issuedDate = certificate.issuedAt
    ? new Date(certificate.issuedAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Fecha no disponible'

  const handleDownload = async () => {
    if (certificate.file?.url) {
      // Open the file in a new tab for download
      window.open(certificate.file.url, '_blank')
    } else {
      // Generate certificate download URL (implement this in your backend)
      const downloadUrl = `/api/certificates/${certificate.id}/download`
      window.open(downloadUrl, '_blank')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificado - ${course?.title}`,
          text: `He completado el curso "${course?.title}" en KAAB LMS`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Enlace copiado al portapapeles')
    }
  }

  return (
    <Card className='overflow-hidden hover:shadow-lg transition-shadow'>
      <div className='relative aspect-[1.414/1] bg-gradient-to-br from-primary/10 to-primary/5 p-6 flex flex-col items-center justify-center text-center border-b'>
        <div className='absolute top-4 right-4'>
          <Badge variant='default' className='bg-green-500'>
            <BadgeCheckIcon className='w-3 h-3 mr-1' />
            Certificado
          </Badge>
        </div>

        <div className='mb-4'>
          <div className='w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center'>
            <BadgeCheckIcon className='w-8 h-8 text-primary' />
          </div>
        </div>

        <h3 className='font-bold text-lg mb-2 line-clamp-2'>
          Certificado de Completación
        </h3>

        {course && (
          <p className='text-sm text-muted-foreground line-clamp-2'>
            {course.title}
          </p>
        )}
      </div>

      <div className='p-4'>
        <div className='space-y-3 mb-4'>
          {certificate.code && (
            <div className='text-xs'>
              <span className='text-muted-foreground'>N° Certificado: </span>
              <span className='font-mono font-semibold'>{certificate.code}</span>
            </div>
          )}

          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
            <CalendarIcon className='w-3 h-3' />
            <span>Emitido: {issuedDate}</span>
          </div>
        </div>

        <div className='flex gap-2'>
          <Button
            size='sm'
            className='flex-1'
            onClick={handleDownload}
          >
            <DownloadIcon className='w-4 h-4 mr-1' />
            Descargar
          </Button>

          <Button
            size='sm'
            variant='outline'
            onClick={handleShare}
            title='Compartir certificado'
          >
            <ExternalLinkIcon className='w-4 h-4' />
          </Button>
        </div>

        {certificate.code && (
          <Button
            asChild
            size='sm'
            variant='ghost'
            className='w-full mt-2 text-xs'
          >
            <Link href={`/verify-certificate/${certificate.code}`} target='_blank'>
              Verificar autenticidad
              <ExternalLinkIcon className='w-3 h-3 ml-1' />
            </Link>
          </Button>
        )}
      </div>
    </Card>
  )
}

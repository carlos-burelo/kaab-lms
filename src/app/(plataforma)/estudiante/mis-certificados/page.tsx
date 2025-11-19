import { getCertificates } from '@/actions/student/certificate.actions'
import { EmptyState } from '@/components/ui/empty'
import { BadgeCheckIcon } from 'lucide-react'
import { CertificatesList } from './components/CertificatesList'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Mis Certificados - KAAB LMS',
  description: 'Visualiza y descarga tus certificados de cursos completados'
}

export default async function MisCertificadosPage() {
  const result = await getCertificates({})

  if (!result.success) {
    redirect('/sign-in')
  }

  const certificates = (result.data as any) || []

  return (
    <div className='p-4 lg:p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Mis Certificados</h1>
        <p className='text-muted-foreground mt-2'>
          Tus logros y certificados de cursos completados
        </p>
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          icon={<BadgeCheckIcon className='w-16 h-16' />}
          title='Aún no tienes certificados'
          description='Completa tus cursos para obtener certificados que validen tu aprendizaje'
          actionLabel='Ver mis cursos'
          actionHref='/estudiante/mis-cursos'
        />
      ) : (
        <CertificatesList certificates={certificates} />
      )}
    </div>
  )
}

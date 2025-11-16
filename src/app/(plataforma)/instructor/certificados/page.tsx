import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CertificatesGrig } from './components/certificados-grid'

export default function Page() {
  return (
    <>
      <header className='border-b border-border flex items-center justify-between p-4'>
        <div className='flex items-center gap-3'>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>Plantillas de Certificados</h1>
            <p className='text-sm text-muted-foreground'>Administra tus plantillas disponibles</p>
          </div>
        </div>
        <Link href='/instructor/certificados/nuevo'>
          <Button>
            <PlusIcon className='mr-2 h-4 w-4' />
            Nueva Plantilla
          </Button>
        </Link>
      </header>
      <main className='p-4'>
        <CertificatesGrig />
      </main>
    </>
  )
}

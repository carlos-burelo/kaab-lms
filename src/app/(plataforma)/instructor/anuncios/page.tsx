import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AnnouncementsDataTable } from './components/AnnouncementsDataTable'

export default function AnnouncementsPage() {
  return (
    <>
      <header className='border-b border-border flex items-center justify-between p-4'>
        <div className='flex items-center gap-3'>
          <div>
            <h1 className='text-2xl font-bold text-foreground'>Anuncios</h1>
            <p className='text-sm text-muted-foreground'>Gestiona los anuncios de tus cursos</p>
          </div>
        </div>
        <Link href='/instructor/anuncios/nuevo'>
          <Button>
            <PlusIcon className='mr-2 h-4 w-4' />
            Nuevo Anuncio
          </Button>
        </Link>
      </header>
      <main className='p-4'>
        <AnnouncementsDataTable />
      </main>
    </>
  )
}

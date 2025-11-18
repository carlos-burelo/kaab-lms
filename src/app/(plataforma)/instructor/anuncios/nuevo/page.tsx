import { AnnouncementForm } from '../components/AnnouncementForm'

export default function NewAnnouncementPage() {
  return (
    <>
      <header className='border-b border-border p-4'>
        <h1 className='text-2xl font-bold text-foreground'>Nuevo Anuncio</h1>
        <p className='text-sm text-muted-foreground'>
          Crea un nuevo anuncio para tus estudiantes
        </p>
      </header>
      <main className='p-4'>
        <AnnouncementForm />
      </main>
    </>
  )
}

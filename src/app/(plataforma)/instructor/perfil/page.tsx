import { InstructorProfileForm } from './components/InstructorProfileForm'

export default function InstructorProfilePage() {
  return (
    <>
      <header className='border-b border-border p-4'>
        <h1 className='text-2xl font-bold text-foreground'>Mi Perfil</h1>
        <p className='text-sm text-muted-foreground'>Gestiona tu información profesional y de pago</p>
      </header>
      <main className='p-4'>
        <InstructorProfileForm />
      </main>
    </>
  )
}

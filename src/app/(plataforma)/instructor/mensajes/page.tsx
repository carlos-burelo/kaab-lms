import { MessagingInterface } from './components/MessagingInterface'

export default function MessagesPage() {
  return (
    <>
      <header className='border-b border-border p-4'>
        <h1 className='text-2xl font-bold text-foreground'>Mensajes</h1>
        <p className='text-sm text-muted-foreground'>Comunícate con tus estudiantes</p>
      </header>
      <main className='p-0'>
        <MessagingInterface />
      </main>
    </>
  )
}

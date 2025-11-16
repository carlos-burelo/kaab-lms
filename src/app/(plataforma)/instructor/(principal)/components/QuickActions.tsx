import { BookCopyIcon, BookOpenCheckIcon, BookOpenTextIcon, ClipboardCheckIcon, MapIcon } from 'lucide-react'
import { QuickActionButton } from '@/components/shared/QuickActionButton'

export function QuickActions() {
  return (
    <section className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 py-2'>
      <QuickActionButton title='Curso' icon={<BookCopyIcon />} className='bg-cyan-500' />
      <QuickActionButton title='Lección' icon={<BookOpenTextIcon />} className='bg-purple-500' />
      <QuickActionButton title='Tarea' icon={<ClipboardCheckIcon />} className='bg-orange-500' />
      <QuickActionButton title='Quizz' icon={<BookOpenCheckIcon />} className='bg-teal-500' />
      <QuickActionButton title='Ruta' icon={<MapIcon />} className='bg-pink-500' />
    </section>
  )
}

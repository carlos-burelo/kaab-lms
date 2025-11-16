import { MessageCircleIcon } from 'lucide-react'

export function CourseDiscussionZone() {
  return (
    <>
      <MessageCircleIcon className='h-12 w-12 mx-auto text-gray-400' />
      <h3 className='mt-2 font-semibold'>Discusión</h3>
      <p className='mt-1 text-sm text-gray-500'>Aquí se mostrarán los hilos de `HiloDiscusion` relacionados a `cursoId`.</p>
    </>
  )
}

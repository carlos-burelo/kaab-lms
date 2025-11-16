import { DownloadIcon, FileTextIcon } from 'lucide-react'

interface CourseAttachmentZoneProps {
  leccion: any
}

export function CourseAttachmentZone({ leccion }: CourseAttachmentZoneProps) {
  return (
    <>
      <h3 className='font-semibold'>Archivos de la Lección</h3>
      {leccion.attachments?.length > 0 ? (
        leccion.attachments.map((adjunto: any) => (
          <a
            key={adjunto.id}
            href={adjunto.file?.url || '#'}
            download
            className='flex items-center justify-between p-3 border-muted-foreground/20 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition'
          >
            <span className='flex items-center gap-3'>
              <FileTextIcon className='h-5 w-5 text-blue-500' />
              <span className='text-sm font-medium'>{adjunto.fileId}</span>
            </span>
            <DownloadIcon className='h-4 w-4 text-gray-500' />
          </a>
        ))
      ) : (
        <p className='text-sm text-gray-500 text-center mt-4'>No hay archivos adjuntos para esta lección.</p>
      )}
    </>
  )
}

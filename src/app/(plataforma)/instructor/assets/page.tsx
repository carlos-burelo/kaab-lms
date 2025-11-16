import { redirect } from 'next/navigation'
import { AssetsGallery } from '@/components/assets/AssetsGallery'
import { fileRepository } from '@/database/repositories'
import { getSession } from '@/lib/auth'

export default async function AssetsPage() {
  const session = await getSession()

  if (!session?.id) {
    redirect('/sign-in')
  }

  // Get initial files
  const filesResult = await fileRepository.getUploadedFiles({
    filters: {
      userId: session.id
    },
    limit: 50,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // Get available file types
  const types = await fileRepository.getAvailableFileTypes(session.id)

  return (
    <div className='space-y-6 p-4'>
      <div className='flex items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Assets & Files</h1>
          <p className='text-muted-foreground'>Manage your uploaded files and media</p>
        </div>
      </div>

      <AssetsGallery initialFiles={filesResult} initialTypes={types} />
    </div>
  )
}

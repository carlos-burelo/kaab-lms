import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PlantillaPreviewClient } from '../components/TemplateCertPreview'

export default async function PlantillaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSession()
  const { id: userId } = user
  const cursos = await prisma.course.findMany({
    select: {
      id: true,
      title: true
    },
    where: {
      instructorId: userId
    }
  })

  const plantilla = await prisma.certificateTemplate.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      variables: true,
      file: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return (
    <div className='p-4'>
      <PlantillaPreviewClient plantilla={plantilla!} cursos={cursos} />
    </div>
  )
}

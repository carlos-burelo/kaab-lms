'use client'

import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ContentType } from '@prisma/client'
import { PlusIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createLessonContent, deleteLessonContent, getLessonById, updateContentPositions } from '@/actions/courseActions'
import { Button } from '@/components/ui/button'
import { ContentTypeSelector } from './ContentTypeSelector'
import { SortableContentItem } from './SortableContentItem'

type LessonResponse = Awaited<ReturnType<typeof getLessonById>>
type Lesson = NonNullable<LessonResponse['data']>
type ContentItem = Lesson['contents'][number]

interface LessonContentEditorProps {
  lessonId: string
  courseId: string
}

export function CourseContentEditor({ lessonId, courseId }: LessonContentEditorProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [contents, setContents] = useState<ContentItem[]>([])
  const [isAddingContent, setIsAddingContent] = useState(false)
  const [_isLoading, setIsLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  )

  const loadLesson = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await getLessonById(lessonId)
      if (response.success && response.data) {
        setLesson(response.data)
        setContents(response.data.contents || [])
      }
    } finally {
      setIsLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    loadLesson()
  }, [loadLesson])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = contents.findIndex((item) => item.id === active.id)
    const newIndex = contents.findIndex((item) => item.id === over.id)
    const reordered = arrayMove(contents, oldIndex, newIndex)
    setContents(reordered)

    const updates = reordered.map((item, index) => ({
      id: item.id,
      position: index
    }))

    try {
      await updateContentPositions(updates, courseId)
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddContent = async (tipo: ContentType) => {
    if (!lesson) return
    try {
      const formData = new FormData()
      formData.append('lessonId', lesson.id)
      formData.append('type', tipo)
      formData.append('content', '')

      const response = await createLessonContent(formData)
      if (response.success && response.data) {
        setContents((prev) => [...prev, response.data])
      }
      setIsAddingContent(false)
    } catch (error) {
      console.error(error)
      alert('Error al crear el contenido')
    }
  }

  const handleUpdateContent = (contentId: string, data: Partial<ContentItem>) => {
    setContents((prev) => prev.map((item) => (item.id === contentId ? { ...item, ...data } : item)))
  }

  const handleDeleteContent = async (contentId: string) => {
    try {
      const formData = new FormData()
      formData.append('contentId', contentId)

      const response = await deleteLessonContent(formData)
      if (response.success) {
        setContents((prev) => prev.filter((item) => item.id !== contentId))
      }
    } catch (error) {
      console.error(error)
      alert('Error al eliminar el contenido')
    }
  }

  return (
    <main className='w-full col-span-9 overflow-y-auto'>
      <header className='sticky top-0 z-10 bg-background p-2 flex items-center justify-between border-b'>
        <h1 className='text-lg font-bold'>Editor de Contenido del Curso</h1>
        <Button onClick={() => setIsAddingContent(true)} disabled={isAddingContent} size='sm'>
          <PlusIcon className='w-4 h-4' />
          Agregar contenido
        </Button>
      </header>

      <section className='mt-2 px-2'>
        <div className='flex-1'>
          <div className='space-y-6'>
            {isAddingContent && (
              <div className='p-4 border border-dashed rounded-lg bg-secondary/10'>
                <ContentTypeSelector onSelect={handleAddContent} onCancel={() => setIsAddingContent(false)} />
              </div>
            )}

            {contents.length === 0 && !isAddingContent ? (
              <div className='text-center py-12 border border-dashed rounded-lg'>
                <p className='text-muted-foreground mb-4'>No hay contenido.</p>
                <Button onClick={() => setIsAddingContent(true)} variant='outline'>
                  <PlusIcon className='w-4 h-4 mr-2' />
                  Agregar primer contenido
                </Button>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={contents.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <div className='space-y-2'>
                    {contents.map((content) => (
                      <SortableContentItem
                        key={content.id}
                        content={content}
                        onUpdate={handleUpdateContent}
                        onDelete={handleDeleteContent}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

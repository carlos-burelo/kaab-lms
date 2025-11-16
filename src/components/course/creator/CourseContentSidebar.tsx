'use client'

import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { BookOpen, EditIcon, GripVertical, Plus, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createLesson, createModule, deleteLesson, deleteModule } from '@/actions/courseActions'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SortableItem from './SortableItem'
import type { DetallesDelCurso } from './types'

interface CourseContentSidebarProps {
  course: DetallesDelCurso | null
}

function AddModuleInput({ value, onChange, onAdd, disabled }: any) {
  return (
    <div className='border-b p-2'>
      <div className='flex gap-2 items-center'>
        <Input
          type='text'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && onAdd()}
          placeholder='Nombre del módulo'
          disabled={disabled}
          className='flex-1'
        />
        <Button onClick={onAdd} disabled={disabled || !value.trim()} size='sm'>
          <Plus className='w-4 h-4' />
        </Button>
      </div>
    </div>
  )
}

function AddLessonInput({ moduloId, value, setValue, onAdd, disabled }: any) {
  return (
    <div className='flex gap-2'>
      <Input
        type='text'
        value={value || ''}
        onChange={(e) => setValue(moduloId, e.target.value)}
        onKeyUp={(e) => e.key === 'Enter' && onAdd(moduloId)}
        placeholder='Nueva lección'
        disabled={disabled}
        className='flex-1'
      />
      <Button size='sm' onClick={() => onAdd(moduloId)} disabled={disabled || !value?.trim()}>
        <Plus className='w-4 h-4' />
      </Button>
    </div>
  )
}

function LessonList({ modulo, sensors, onDragEnd, onDelete, courseId }: any) {
  return (
    <DndContext sensors={sensors} onDragEnd={(e) => onDragEnd(e, modulo.id)}>
      <SortableContext items={modulo.lessons.map((l: any) => l.id)} strategy={verticalListSortingStrategy}>
        <div className='space-y-2'>
          {modulo.lessons.map((leccion: any) => (
            <SortableItem key={leccion.id} id={leccion.id}>
              <div className='flex cursor-grab items-center gap-3 py-0 px-2 rounded-lg border border-input bg-background hover:bg-secondary/50 group transition'>
                <GripVertical className='w-4 h-4 text-muted-foreground shrink-0' />
                <span className='flex-1 truncate text-sm font-medium'>{leccion.title}</span>
                <div className='flex gap-1 items-center opacity-0 group-hover:opacity-100 transition'>
                  <Button variant='ghost' size='icon' className='p-0 h-6 w-6 rounded-sm' asChild>
                    <Link href={`/instructor/cursos/${courseId}?step=contenido&leccion=${leccion.id}`}>
                      <EditIcon className='w-3 h-3 text-primary' />
                    </Link>
                  </Button>
                  <Button variant='ghost' size='icon' onClick={() => onDelete(modulo.id, leccion.id)}>
                    <Trash2Icon className='w-3 h-3' />
                  </Button>
                </div>
              </div>
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default function CourseContentSidebar({ course }: CourseContentSidebarProps) {
  const [modulos, setModulos] = useState<any[]>(course?.modules || [])
  const [isPending, startTransition] = useTransition()
  const [newModuloTitle, setNewModuloTitle] = useState('')
  const [newLessonTitle, setNewLessonTitle] = useState<Record<string, string>>({})
  const sensors = useSensors(useSensor(PointerSensor))
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const onDragEnd = (e: DragEndEvent, moduloId: string) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    setModulos((prev: any[]) =>
      prev.map((m: any) =>
        m.id === moduloId
          ? {
              ...m,
              lessons: arrayMove(
                m.lessons,
                m.lessons.findIndex((l: any) => l.id === active.id),
                m.lessons.findIndex((l: any) => l.id === over.id)
              )
            }
          : m
      )
    )
  }

  const handleAddModule = () => {
    if (!newModuloTitle.trim() || !course) return
    startTransition(async () => {
      const formData = new FormData()
      formData.append('courseId', course.id)
      formData.append('title', newModuloTitle)

      const response = await createModule(formData)
      if (response.success && response.data) {
        setModulos((prev: any[]) => [...prev, { ...response.data, lessons: [] }])
        setNewModuloTitle('')
        toast.success('Módulo creado correctamente')
      }
    })
  }

  const handleAddLesson = (moduloId: string) => {
    const title = newLessonTitle[moduloId]
    if (!title?.trim() || !course) return
    startTransition(async () => {
      const formData = new FormData()
      formData.append('moduleId', moduloId)
      formData.append('title', title)
      formData.append('courseId', course.id)

      const response = await createLesson(formData)
      if (response.success && response.data) {
        const l = { ...response.data, contents: [], attachments: [], quiz: null }
        setModulos((prev: any[]) => prev.map((m: any) => (m.id === moduloId ? { ...m, lessons: [...m.lessons, l] } : m)))
        setNewLessonTitle((prev) => ({ ...prev, [moduloId]: '' }))
        toast.success('Lección creada correctamente')
      }
    })
  }

  const handleDeleteModule = (moduloId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este módulo y todas sus lecciones?')) return
    startTransition(async () => {
      const formData = new FormData()
      formData.append('moduleId', moduloId)

      const response = await deleteModule(formData)
      if (response.success) {
        setModulos((prev: any[]) => prev.filter((m: any) => m.id !== moduloId))
        toast.success('Módulo eliminado correctamente')
      }
    })
  }

  const handleDeleteLesson = (moduloId: string, leccionId: string) => {
    if (!confirm('¿Eliminar esta lección?')) return
    startTransition(async () => {
      const formData = new FormData()
      formData.append('lessonId', leccionId)

      const response = await deleteLesson(formData)
      if (response.success) {
        setModulos((prev: any[]) =>
          prev.map((m: any) => (m.id === moduloId ? { ...m, lessons: m.lessons.filter((l: any) => l.id !== leccionId) } : m))
        )
        toast.success('Lección eliminada correctamente')
      }
    })
  }

  const setLessonValue = (id: string, v: string) => setNewLessonTitle((p) => ({ ...p, [id]: v }))

  return (
    <div className='space-y-4 h-full'>
      <AddModuleInput value={newModuloTitle} onChange={setNewModuloTitle} onAdd={handleAddModule} disabled={isPending} />
      {modulos.length === 0 ? (
        <div className='text-center py-12'>
          <BookOpen className='w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50' />
          <p className='text-muted-foreground mb-2'>No hay módulos aún</p>
          <p className='text-xs text-muted-foreground/70'>Crea el primero arriba para comenzar</p>
        </div>
      ) : (
        <Accordion type='multiple' defaultValue={modulos.map((m) => m.id)} className='space-y-2 px-2'>
          {modulos.map((modulo) => (
            <AccordionItem key={modulo.id} value={modulo.id} className='border rounded-lg overflow-x-hidden'>
              <div className='flex items-center gap-0 bg-secondary/50 hover:bg-secondary transition-colors p-2 truncate'>
                <div className='cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0'>
                  <GripVertical className='w-5 h-5' />
                </div>
                <AccordionTrigger className='flex-1 hover:no-underline gap-3 py-0 px-3 min-w-0'>
                  <div className='flex items-center gap-3 flex-1 min-w-0'>
                    <BookOpen className='w-4 h-4 shrink-0' />
                    <span className='font-semibold truncate'>{modulo.title}</span>
                  </div>
                </AccordionTrigger>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleDeleteModule(modulo.id)}
                  disabled={isPending}
                  className='hover:bg-destructive/10 hover:text-destructive shrink-0'
                >
                  <Trash2Icon className='w-4 h-4' />
                </Button>
              </div>

              <AccordionContent className='px-2 py-4 border-t bg-background space-y-4'>
                <AddLessonInput
                  moduloId={modulo.id}
                  value={newLessonTitle[modulo.id]}
                  setValue={setLessonValue}
                  onAdd={handleAddLesson}
                  disabled={isPending}
                />
                {modulo.lessons.length === 0 ? (
                  <div className='text-center py-8'>
                    <p className='text-sm text-muted-foreground'>No hay lecciones en este módulo</p>
                  </div>
                ) : (
                  mounted && (
                    <LessonList
                      modulo={modulo}
                      sensors={sensors}
                      onDragEnd={onDragEnd}
                      onDelete={handleDeleteLesson}
                      courseId={course?.id}
                    />
                  )
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}

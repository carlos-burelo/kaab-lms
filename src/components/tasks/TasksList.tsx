'use client'

import { format, formatDistanceToNow, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, CheckSquare, Edit, Flag, ListChecks, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createPersonalTask, deletePersonalTask, toggleTaskCompletion, updatePersonalTask } from '@/actions/task.actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type Task = {
  id: string
  title: string
  description?: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: Date | null
  tags?: any
  completedAt?: Date | null
  createdAt: Date
}

interface TasksListProps {
  initialTasks: Task[]
}

const priorityConfig = {
  LOW: { label: 'Baja', color: 'bg-gray-500', icon: Flag },
  MEDIUM: { label: 'Media', color: 'bg-blue-500', icon: Flag },
  HIGH: { label: 'Alta', color: 'bg-orange-500', icon: Flag },
  URGENT: { label: 'Urgente', color: 'bg-red-500', icon: Flag }
}

const _statusConfig = {
  PENDING: { label: 'Pendiente', color: 'border-gray-500' },
  IN_PROGRESS: { label: 'En progreso', color: 'border-blue-500' },
  COMPLETED: { label: 'Completada', color: 'border-green-500' },
  CANCELED: { label: 'Cancelada', color: 'border-red-500' }
}

export function TasksList({ initialTasks }: TasksListProps) {
  const [tasks, _setTasks] = useState<Task[]>(initialTasks)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Task['priority'],
    dueDate: ''
  })
  const router = useRouter()
  const { toast } = useToast()

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueDate: ''
    })
    setEditingTask(null)
  }

  const handleCreateTask = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'El título es requerido',
        variant: 'destructive'
      })
      return
    }

    const result = await createPersonalTask({
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
    })

    if (result.success) {
      toast({
        title: 'Tarea creada',
        description: 'La tarea ha sido creada correctamente'
      })
      setIsCreateDialogOpen(false)
      resetForm()
      router.refresh()
      // Reload tasks
      window.location.reload()
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive'
      })
    }
  }

  const handleUpdateTask = async () => {
    if (!editingTask) return

    const result = await updatePersonalTask({
      taskId: editingTask.id,
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null
    })

    if (result.success) {
      toast({
        title: 'Tarea actualizada',
        description: 'La tarea ha sido actualizada correctamente'
      })
      setEditingTask(null)
      resetForm()
      router.refresh()
      window.location.reload()
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive'
      })
    }
  }

  const handleToggleComplete = async (taskId: string) => {
    const result = await toggleTaskCompletion(taskId)
    if (result.success) {
      router.refresh()
      window.location.reload()
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive'
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return

    const result = await deletePersonalTask(taskId)
    if (result.success) {
      toast({
        title: 'Tarea eliminada',
        description: 'La tarea ha sido eliminada correctamente'
      })
      router.refresh()
      window.location.reload()
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive'
      })
    }
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''
    })
  }

  const pendingTasks = tasks.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS')
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED')
  const overdueTasks = pendingTasks.filter((t) => t.dueDate && isPast(new Date(t.dueDate)))

  return (
    <div className='space-y-6'>
      {/* Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium'>Tareas Pendientes</CardTitle>
            <ListChecks className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{pendingTasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium'>Tareas Vencidas</CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-500'>{overdueTasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium'>Tareas Completadas</CardTitle>
            <CheckSquare className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-500'>{completedTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Create Button */}
      <div className='flex justify-end'>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className='h-4 w-4 mr-2' />
              Nueva Tarea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Tarea</DialogTitle>
              <DialogDescription>Agrega una nueva tarea a tu lista</DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='title'>Título *</Label>
                <Input
                  id='title'
                  placeholder='Título de la tarea'
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Descripción</Label>
                <Textarea
                  id='description'
                  placeholder='Descripción de la tarea'
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='priority'>Prioridad</Label>
                  <Select value={formData.priority} onValueChange={(v: any) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='LOW'>Baja</SelectItem>
                      <SelectItem value='MEDIUM'>Media</SelectItem>
                      <SelectItem value='HIGH'>Alta</SelectItem>
                      <SelectItem value='URGENT'>Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='dueDate'>Fecha límite</Label>
                  <Input
                    id='dueDate'
                    type='date'
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTask}>Crear Tarea</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tasks Tabs */}
      <Tabs defaultValue='pending' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='pending'>Pendientes ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value='completed'>Completadas ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value='pending' className='space-y-3 mt-4'>
          {pendingTasks.length === 0 ? (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <ListChecks className='h-16 w-16 text-muted-foreground mb-4' />
                <p className='text-muted-foreground text-center'>No tienes tareas pendientes</p>
              </CardContent>
            </Card>
          ) : (
            pendingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggleComplete}
                onEdit={openEditDialog}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value='completed' className='space-y-3 mt-4'>
          {completedTasks.length === 0 ? (
            <Card>
              <CardContent className='flex flex-col items-center justify-center py-12'>
                <CheckSquare className='h-16 w-16 text-muted-foreground mb-4' />
                <p className='text-muted-foreground text-center'>No has completado ninguna tarea</p>
              </CardContent>
            </Card>
          ) : (
            completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggleComplete}
                onEdit={openEditDialog}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
            <DialogDescription>Modifica los detalles de la tarea</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-title'>Título *</Label>
              <Input
                id='edit-title'
                placeholder='Título de la tarea'
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit-description'>Descripción</Label>
              <Textarea
                id='edit-description'
                placeholder='Descripción de la tarea'
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit-priority'>Prioridad</Label>
                <Select value={formData.priority} onValueChange={(v: any) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='LOW'>Baja</SelectItem>
                    <SelectItem value='MEDIUM'>Media</SelectItem>
                    <SelectItem value='HIGH'>Alta</SelectItem>
                    <SelectItem value='URGENT'>Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit-dueDate'>Fecha límite</Label>
                <Input
                  id='edit-dueDate'
                  type='date'
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditingTask(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateTask}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete
}: {
  task: Task
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}) {
  const isCompleted = task.status === 'COMPLETED'
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isCompleted
  const priorityInfo = priorityConfig[task.priority]

  return (
    <Card className={cn('transition-all hover:shadow-md', isCompleted && 'opacity-60')}>
      <CardContent className='p-4'>
        <div className='flex items-start gap-4'>
          <div className='pt-1'>
            <Checkbox checked={isCompleted} onCheckedChange={() => onToggle(task.id)} className='h-5 w-5' />
          </div>

          <div className='flex-1 space-y-2'>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex-1'>
                <h3 className={cn('font-semibold', isCompleted && 'line-through text-muted-foreground')}>{task.title}</h3>
                {task.description && (
                  <p className={cn('text-sm text-muted-foreground mt-1', isCompleted && 'line-through')}>{task.description}</p>
                )}
              </div>

              <div className='flex items-center gap-2'>
                <Button variant='ghost' size='icon' onClick={() => onEdit(task)}>
                  <Edit className='h-4 w-4' />
                </Button>
                <Button variant='ghost' size='icon' onClick={() => onDelete(task.id)}>
                  <Trash2 className='h-4 w-4 text-destructive' />
                </Button>
              </div>
            </div>

            <div className='flex items-center gap-3 flex-wrap'>
              <Badge variant='outline' className={priorityInfo.color}>
                <Flag className='h-3 w-3 mr-1' />
                {priorityInfo.label}
              </Badge>

              {task.dueDate && (
                <Badge variant='outline' className={isOverdue ? 'border-red-500 text-red-500' : ''}>
                  <Calendar className='h-3 w-3 mr-1' />
                  {format(new Date(task.dueDate), 'dd MMM yyyy', { locale: es })}
                  {isOverdue && ' (Vencida)'}
                </Badge>
              )}

              {task.completedAt && (
                <p className='text-xs text-muted-foreground'>
                  Completada {formatDistanceToNow(new Date(task.completedAt), { addSuffix: true, locale: es })}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

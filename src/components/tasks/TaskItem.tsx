'use client'

import { EstadoTareaPersonal } from '@prisma/client'
import type { CheckedState } from '@radix-ui/react-checkbox'
import { Trash2Icon } from 'lucide-react'
import { useTransition } from 'react'
import { deleteTaskAction, completeTaskAction as toggleTaskAction } from '@/actions/taskActions'
import type { GetPersonalTasksProps } from '@/database'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'

interface TaskItemProps {
  task: GetPersonalTasksProps
  index: number
  total: number
}

export function TaskItem({ task, index, total }: TaskItemProps) {
  const [pending, startTransition] = useTransition()

  const completeTask = (state: CheckedState) => {
    startTransition(async () => {
      await toggleTaskAction(task.id, state)
    })
  }

  const deleteTask = () => {
    startTransition(async () => {
      await deleteTaskAction(task.id)
    })
  }

  const IS_COMPLETED = task.estado === EstadoTareaPersonal.COMPLETADA

  return (
    <>
      <div className='p-2 grid'>
        <div className='gap-4 items-center flex overflow-hidden'>
          <div className=''>
            <Checkbox name='status' onCheckedChange={completeTask} checked={IS_COMPLETED} />
          </div>
          <div className={cn('flex flex-col flex-1 min-w-0 overflow-hidden', { 'opacity-50': pending })}>
            <h3 className={cn('truncate text-xs', { 'line-through text-muted-foreground': IS_COMPLETED })}>{task.titulo}</h3>
            <p className='truncate text-xs'>{task.descripcion}</p>
          </div>

          <div className=''>
            <Button variant='outline' className='p-1' size='icon' onClick={deleteTask}>
              <Trash2Icon className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </div>
      {index !== total - 1 && <div className='border-t' />}
    </>
  )
}

import { TurtleIcon } from 'lucide-react'
import { instructorRepository } from '@/database'
import { getSession } from '@/lib/auth'
import { ItemGroup, ItemSeparator } from '../ui/item'
import { NewTaskDialog } from './NewTaskForm'
import { TaskItem } from './TaskItem'

export async function TaskList() {
  const session = await getSession()
  if (!session?.id) {
    return null
  }

  const tasks = await instructorRepository.getPersonalTasks(session.id)

  return (
    <div className='flex w-full max-w-md flex-col gap-2 border rounded-md'>
      <h2 className='px-2 pt-2 font-semibold text-lg'>
        Tareas personales
        <span className='text-sm text-muted-foreground'> ({tasks.length} tareas)</span>
      </h2>
      <ItemSeparator />
      <div className='px-2'>
        <NewTaskDialog />
      </div>
      {tasks.length === 0 ? (
        <div className='p-4 text-center text-sm text-muted-foreground grid min-h-60 max-h-96 content-center'>
          <TurtleIcon className='mx-auto mb-2 w-6 h-6' />
          <span>No hay tareas personales disponibles.</span>
        </div>
      ) : (
        <ItemGroup className='grid overflow-hidden '>
          {tasks.map((task, index) => (
            <TaskItem key={task.id} task={task} index={index} total={tasks.length} />
          ))}
        </ItemGroup>
      )}
    </div>
  )
}

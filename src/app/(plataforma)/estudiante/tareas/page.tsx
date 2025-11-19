import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getPersonalTasks } from '@/actions/task.actions'
import { TasksList } from '@/components/tasks/TasksList'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Mis Tareas',
  description: 'Gestiona tus tareas personales'
}

export default async function TasksPage() {
  const tasksResult = await getPersonalTasks()
  const tasks = tasksResult.success ? tasksResult.data : []

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Mis Tareas</h1>
        <p className='text-muted-foreground'>Organiza y gestiona tus tareas personales</p>
      </div>

      <Suspense fallback={<TasksSkeleton />}>
        <TasksList initialTasks={tasks || []} />
      </Suspense>
    </div>
  )
}

function TasksSkeleton() {
  return (
    <div className='space-y-4'>
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className='p-4'>
            <div className='flex items-center gap-4'>
              <Skeleton className='h-5 w-5 rounded' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-3 w-1/2' />
              </div>
              <Skeleton className='h-8 w-20' />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

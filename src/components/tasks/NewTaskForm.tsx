import { PlusIcon } from 'lucide-react'
import { createTaskAction } from '@/actions/taskActions'
import { Select } from '../extensions/select'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

export function NewTaskDialog() {
  // instructorDatabase is not available, using defaults
  const metadata = { priority: ['Baja', 'Media', 'Alta'], status: ['Pendiente', 'En progreso', 'Completada'] }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' className='w-full'>
          <PlusIcon className='mr-2' />
          <span>Crear tarea</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={createTaskAction}>
          <DialogHeader>
            <DialogTitle>Agregar nueva tarea</DialogTitle>
            <DialogDescription>Completa el formulario para agregar una nueva tarea personal.</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 mt-4'>
            <div className='grid grid-cols-2 gap-2'>
              <Input name='titulo' placeholder='Nombre de la tarea' required />
              <Input name='fechaVencimiento' placeholder='Fecha de vencimiento' type='date' className='w-fit' required />
            </div>
            <div className='flex gap-2'>
              <Select
                name='estado'
                options={metadata.status.map((s: string) => ({ label: s, value: s }))}
                defaultValue={metadata.status[0]}
                required
              />
              <Select
                name='prioridad'
                options={metadata.priority.map((p: string) => ({ label: p, value: p }))}
                defaultValue={metadata.priority[0]}
                required
              />
            </div>
            <Textarea name='descripcion' placeholder='Descripción de la tarea' required />
          </div>
          <DialogFooter className='flex justify-between items-center'>
            <Button type='button' variant='outline'>
              Cancelar
            </Button>
            <Button type='submit'>Crear tarea</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

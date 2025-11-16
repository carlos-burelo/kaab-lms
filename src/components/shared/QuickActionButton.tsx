import { PlusIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

interface QuickActionButtonProps {
  title: string
  icon: React.ReactNode
  className: string
}

export function QuickActionButton({ title, icon, className }: QuickActionButtonProps) {
  return (
    <Button className='col-span-1 flex justify-between items-center pl-0! py-0! ' variant='ghost'>
      <div className='flex gap-2 items-center'>
        <div className={cn('p-2 rounded-md text-white', className)}>{icon}</div>
        <span>{title}</span>
      </div>
      <PlusIcon />
    </Button>
  )
}

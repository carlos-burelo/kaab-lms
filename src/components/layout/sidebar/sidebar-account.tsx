'use client'

import { LogOutIcon } from 'lucide-react'
import type { Session } from 'next-auth'
import { useTransition } from 'react'
import { signOut } from '@/actions/signInAction'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export function SidebarAccount({ user }: { user: Session['user'] }) {
  const [pending, startTransition] = useTransition()
  if (!user) throw new Error('No user detected')
  const { name = 'SN', imagen = '/fallback-avatar.webp', email } = user

  function handleLogout() {
    startTransition(async () => await signOut())
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar nombre={name} imagen={imagen} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
        side={'bottom'}
        align='end'
        sideOffset={4}
      >
        <DropdownMenuLabel className='p-0 font-normal'>
          <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
            <UserAvatar nombre={name} imagen={imagen} />
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-medium'>{name}</span>
              <span className='truncate text-xs'>{email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Button variant='destructive' asChild className='w-full'>
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={pending}
            className='bg-destructive/90 focus:bg-destructive focus:text-white'
          >
            <LogOutIcon className='text-white' />
            <span className='ml-2'>Cerrar sesión</span>
          </DropdownMenuItem>
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function UserAvatar({ imagen, nombre }: any) {
  return (
    <Avatar className='h-8 w-8 rounded-full outline-1 outline-primary/20'>
      <AvatarImage src={imagen} alt={nombre} className='object-cover' />
      <AvatarFallback className='rounded-lg'>CN</AvatarFallback>
    </Avatar>
  )
}

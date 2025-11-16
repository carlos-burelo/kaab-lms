'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { type User as PrismaUser, UserRole } from '@prisma/client'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Pencil, Star, Trash, User, UserCheck } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { deleteUser, updateUser, updateUserRole } from '../actions'
import type { UpdateUserForm } from '../schemas'
import { updateUserSchema } from '../schemas'

function RowActions({ user }: { user: PrismaUser }) {
  const [isEditModalOpen, setEditModalOpen] = React.useState(false)
  const [isDeleteModalOpen, setDeleteModalOpen] = React.useState(false)
  const [isPromoteModalOpen, setPromoteModalOpen] = React.useState(false)

  const [isPending, startTransition] = React.useTransition()

  const onDelete = () => {
    startTransition(async () => {
      const result = await deleteUser(user.id)
      if (result.success) {
        toast.success(`User ${user.email} eliminado.`)
        setDeleteModalOpen(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  const onPromote = () => {
    startTransition(async () => {
      const result = await updateUserRole(user.id, UserRole.INSTRUCTOR)
      if (result.success) {
        toast.success(`User ${user.email} ahora es INSTRUCTOR.`)
        setPromoteModalOpen(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <>
      {/* --- Disparador del Dropdown con Tooltip --- */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0' disabled={isPending}>
                  <span className='sr-only'>Abrir menú</span>
                  {isPending ? <span className='animate-spin text-xs'>...</span> : <MoreHorizontal className='h-4 w-4' />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>Copiar ID de usuario</DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* --- Acción de Editar (Abre Modal) --- */}
                <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                  <Pencil className='mr-2 h-4 w-4' />
                  Editar User
                </DropdownMenuItem>
                {/* --- Acción de Promover (Abre Modal) --- */}
                {user.role !== UserRole.INSTRUCTOR && (
                  <DropdownMenuItem onClick={() => setPromoteModalOpen(true)}>
                    <UserCheck className='mr-2 h-4 w-4' />
                    Hacer Instructor
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {/* --- Acción de Eliminar (Abre Modal) --- */}
                <DropdownMenuItem className='text-red-600 focus:text-red-600' onClick={() => setDeleteModalOpen(true)}>
                  <Trash className='mr-2 h-4 w-4' />
                  Eliminar usuario
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>
            <p>Opciones</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* --- Modales --- */}
      <EditUserModal user={user} isOpen={isEditModalOpen} setIsOpen={setEditModalOpen} />
      <DeleteUserModal
        user={user}
        isOpen={isDeleteModalOpen}
        setIsOpen={setDeleteModalOpen}
        onConfirm={onDelete}
        isPending={isPending}
      />
      <PromoteUserModal
        user={user}
        isOpen={isPromoteModalOpen}
        setIsOpen={setPromoteModalOpen}
        onConfirm={onPromote}
        isPending={isPending}
      />
    </>
  )
}

function EditUserModal({ user, isOpen, setIsOpen }: { user: PrismaUser; isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const [isPending, startTransition] = React.useTransition()
  const form = useForm<UpdateUserForm>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      nombre: user.email ?? '',
      email: user.email
    }
  })

  const onSubmit = (values: UpdateUserForm) => {
    startTransition(async () => {
      const result = await updateUser(user.id, values)
      if (result.success) {
        toast.success('User actualizado correctamente.')
        setIsOpen(false)
        form.reset()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Editar User</DialogTitle>
          <DialogDescription>Realiza cambios al perfil de {user.email}. Haz clic en guardar cuando termines.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='nombre'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder='John Doe' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type='email' placeholder='user@example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='xp'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Puntos de Experiencia (XP)</FormLabel>
                  <FormControl>
                    <Input type='number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteUserModal({
  user,
  isOpen,
  setIsOpen,
  onConfirm,
  isPending
}: {
  user: PrismaUser
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario{' '}
            <span className='font-medium'>{user.email}</span> de la plataforma.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending} className='bg-red-600 hover:bg-red-700'>
            {isPending ? 'Eliminando...' : 'Sí, eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function PromoteUserModal({
  user,
  isOpen,
  setIsOpen,
  onConfirm,
  isPending
}: {
  user: PrismaUser
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Promoción</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres promover a <span className='font-medium'>{user.email}</span> al rol de INSTRUCTOR?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Promoviendo...' : 'Sí, promover'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const columns: ColumnDef<PrismaUser>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'imagen',
    header: 'Avatar',
    enableHiding: true,
    cell: ({ row }) => {
      const imagenUrl = row.getValue('imagen') as string | null
      const nombre = row.getValue('nombre') as string
      return (
        <Avatar>
          <AvatarFallback>{nombre?.charAt(0).toUpperCase() ?? '?'}</AvatarFallback>
          <AvatarImage src={imagenUrl ?? undefined} alt={`Avatar de ${nombre}`} />
        </Avatar>
      )
    }
  },
  {
    accessorKey: 'nombre',
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Nombre <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => <div className='capitalize'>{row.getValue('nombre')}</div>
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Email <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => <div className='lowercase'>{row.getValue('email')}</div>
  },
  {
    accessorKey: 'rol',

    enableHiding: true,
    enableSorting: true,

    cell: ({ row }) => {
      const rol = row.getValue('rol') as UserRole
      const isInstructor = rol === UserRole.INSTRUCTOR
      const variant = isInstructor ? 'default' : 'secondary'
      const icon = isInstructor ? <Star className='mr-2 h-4 w-4 text-yellow-400' /> : <User className='mr-2 h-4 w-4' />
      return (
        <Badge variant={variant} className='capitalize'>
          {icon}
          {rol.toLowerCase()}
        </Badge>
      )
    },

    filterFn: (row, id, value) => {
      if (value === 'all') return true
      return value.includes(row.getValue(id))
    },
    header({ column }) {
      return (
        <div>
          <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Rol <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        </div>
      )
    }
  },
  {
    accessorKey: 'xp',
    header: () => <div className='text-right'>XP</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('xp'))
      return <div className='text-right font-medium'>{amount}</div>
    }
  },
  {
    accessorKey: 'creadoEn',
    header: 'Registrado',
    cell: ({ row }) => <div>{new Date(row.getValue('creadoEn')).toLocaleDateString()}</div>
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      return <RowActions user={row.original} />
    }
  }
]

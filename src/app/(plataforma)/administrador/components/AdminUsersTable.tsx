'use client'

import { Edit, MoreHorizontal, Search, Shield, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function AdminUsersTable() {
  const [searchTerm, setSearchTerm] = useState('')

  // Datos de ejemplo
  const users = [
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      role: 'STUDENT',
      status: 'active',
      joinedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'María García',
      email: 'maria@example.com',
      role: 'INSTRUCTOR',
      status: 'active',
      joinedAt: '2024-02-10'
    },
    {
      id: '3',
      name: 'Carlos López',
      email: 'carlos@example.com',
      role: 'STUDENT',
      status: 'inactive',
      joinedAt: '2024-03-05'
    },
    {
      id: '4',
      name: 'Ana Rodríguez',
      email: 'ana@example.com',
      role: 'ADMIN',
      status: 'active',
      joinedAt: '2023-12-01'
    },
    {
      id: '5',
      name: 'Miguel Santos',
      email: 'miguel@example.com',
      role: 'INSTRUCTOR',
      status: 'active',
      joinedAt: '2024-04-20'
    }
  ]

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant='destructive'>Administrador</Badge>
      case 'INSTRUCTOR':
        return <Badge variant='default'>Instructor</Badge>
      case 'STUDENT':
        return <Badge variant='secondary'>Estudiante</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    return <Badge variant={status === 'active' ? 'outline' : 'secondary'}>{status === 'active' ? 'Activo' : 'Inactivo'}</Badge>
  }

  return (
    <div className='space-y-4'>
      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar usuario...'
            className='pl-8'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button>Nuevo Usuario</Button>
      </div>

      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de Unión</TableHead>
              <TableHead className='text-right'>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className='font-medium'>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell className='text-sm text-muted-foreground'>
                  {new Date(user.joinedAt).toLocaleDateString('es-ES')}
                </TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' className='h-8 w-8 p-0'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem>
                        <Edit className='h-4 w-4 mr-2' />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Shield className='h-4 w-4 mr-2' />
                        Cambiar Rol
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-red-600'>
                        <Trash2 className='h-4 w-4 mr-2' />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredUsers.length === 0 && (
        <div className='text-center py-8 text-muted-foreground'>
          <p>No se encontraron usuarios</p>
        </div>
      )}
    </div>
  )
}

'use client'

import { CheckCircle, Eye, MoreHorizontal, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function AdminCoursesTable() {
  const [searchTerm, setSearchTerm] = useState('')

  // Datos de ejemplo
  const courses = [
    {
      id: '1',
      title: 'Introducción a React',
      instructor: 'María García',
      students: 45,
      status: 'published',
      rating: 4.8,
      createdAt: '2024-02-10'
    },
    {
      id: '2',
      title: 'JavaScript Avanzado',
      instructor: 'Miguel Santos',
      students: 32,
      status: 'draft',
      rating: 0,
      createdAt: '2024-04-20'
    },
    {
      id: '3',
      title: 'CSS Masterclass',
      instructor: 'María García',
      students: 67,
      status: 'published',
      rating: 4.6,
      createdAt: '2024-01-15'
    },
    {
      id: '4',
      title: 'Node.js Backend',
      instructor: 'Miguel Santos',
      students: 28,
      status: 'published',
      rating: 4.9,
      createdAt: '2024-03-10'
    },
    {
      id: '5',
      title: 'Diseño UX/UI',
      instructor: 'Ana Rodríguez',
      students: 19,
      status: 'review',
      rating: 0,
      createdAt: '2024-05-05'
    }
  ]

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge variant='outline' className='bg-green-50'>
            Publicado
          </Badge>
        )
      case 'draft':
        return <Badge variant='secondary'>Borrador</Badge>
      case 'review':
        return <Badge variant='destructive'>En Revisión</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar curso...'
            className='pl-8'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead className='text-center'>Estudiantes</TableHead>
              <TableHead className='text-center'>Calificación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className='text-right'>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className='font-medium'>{course.title}</TableCell>
                <TableCell>{course.instructor}</TableCell>
                <TableCell className='text-center'>
                  <span className='inline-block px-2 py-1 text-sm bg-muted rounded'>{course.students}</span>
                </TableCell>
                <TableCell className='text-center'>
                  {course.rating > 0 ? (
                    <span className='text-sm font-medium'>{course.rating}/5 ⭐</span>
                  ) : (
                    <span className='text-xs text-muted-foreground'>Sin calificación</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(course.status)}</TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' className='h-8 w-8 p-0'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem>
                        <Eye className='h-4 w-4 mr-2' />
                        Ver Curso
                      </DropdownMenuItem>
                      {course.status === 'review' && (
                        <DropdownMenuItem>
                          <CheckCircle className='h-4 w-4 mr-2' />
                          Aprobar
                        </DropdownMenuItem>
                      )}
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

      {filteredCourses.length === 0 && (
        <div className='text-center py-8 text-muted-foreground'>
          <p>No se encontraron cursos</p>
        </div>
      )}
    </div>
  )
}

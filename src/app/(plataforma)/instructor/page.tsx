import { BookOpen, TrendingUp, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireInstructor } from '@/lib/auth-utils'

export const metadata: Metadata = {
  title: 'Dashboard de Instructor',
  description: 'Panel de control para instructores'
}

/**
 * Esta página está protegida - solo accesible para INSTRUCTOR y ADMIN
 * La verificación ocurre en el servidor durante la renderización
 */
export default async function InstructorPage() {
  // Verificar autenticación y rol en el servidor
  const user = await requireInstructor()

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Dashboard de Instructor</h1>
        <p className='text-muted-foreground'>Bienvenido {user.name}</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Cursos Activos</CardTitle>
            <BookOpen className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>12</div>
            <p className='text-xs text-muted-foreground'>+2 este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Estudiantes</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>324</div>
            <p className='text-xs text-muted-foreground'>+45 nuevos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Ingresos</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$12,450</div>
            <p className='text-xs text-muted-foreground'>Este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Accede rápidamente a tus herramientas</CardDescription>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Link href='/instructor/cursos'>
            <Button className='w-full'>Gestionar Cursos</Button>
          </Link>
          <Link href='/instructor/estudiantes'>
            <Button className='w-full' variant='outline'>
              Ver Estudiantes
            </Button>
          </Link>
          <Link href='/instructor/rutas-aprendizaje'>
            <Button className='w-full' variant='outline'>
              Rutas de Aprendizaje
            </Button>
          </Link>
          <Link href='/instructor/calendar'>
            <Button className='w-full' variant='outline'>
              Calendario
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

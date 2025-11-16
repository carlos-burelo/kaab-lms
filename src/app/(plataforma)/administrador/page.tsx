import { Activity, BarChart3, BookOpen, Settings, Users } from 'lucide-react'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { requireAdmin } from '@/lib/auth-utils'
import { AdminCoursesTable } from './components/AdminCoursesTable'
import { AdminDashboardStats } from './components/AdminDashboardStats'
import { AdminSystemHealth } from './components/AdminSystemHealth'
import { AdminUsersTable } from './components/AdminUsersTable'

export const metadata: Metadata = {
  title: 'Panel de Administración',
  description: 'Gestión centralizada de la plataforma LMS'
}

/**
 * Esta página está protegida - solo accesible para ADMIN
 * La verificación ocurre en el servidor durante la renderización
 */
export default async function AdminPage() {
  // Verificar que solo ADMIN puede acceder
  await requireAdmin()

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Panel de Administración</h1>
          <p className='text-muted-foreground mt-2'>Gestión centralizada de la plataforma LMS</p>
        </div>
        <div className='text-muted-foreground text-sm'>Última actualización: {new Date().toLocaleTimeString('es-ES')}</div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='overview' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview' className='gap-2'>
            <BarChart3 className='h-4 w-4' />
            <span className='hidden sm:inline'>Resumen</span>
          </TabsTrigger>
          <TabsTrigger value='users' className='gap-2'>
            <Users className='h-4 w-4' />
            <span className='hidden sm:inline'>Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value='courses' className='gap-2'>
            <BookOpen className='h-4 w-4' />
            <span className='hidden sm:inline'>Cursos</span>
          </TabsTrigger>
          <TabsTrigger value='health' className='gap-2'>
            <Activity className='h-4 w-4' />
            <span className='hidden sm:inline'>Salud</span>
          </TabsTrigger>
          <TabsTrigger value='settings' className='gap-2'>
            <Settings className='h-4 w-4' />
            <span className='hidden sm:inline'>Config</span>
          </TabsTrigger>
        </TabsList>

        {/* Resumen */}
        <TabsContent value='overview' className='space-y-6'>
          <AdminDashboardStats isLoading={false} />
        </TabsContent>

        {/* Usuarios */}
        <TabsContent value='users' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Administra usuarios, roles y permisos del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminUsersTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cursos */}
        <TabsContent value='courses' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Cursos</CardTitle>
              <CardDescription>Revisa, aprueba y gestiona cursos de la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminCoursesTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salud del Sistema */}
        <TabsContent value='health' className='space-y-6'>
          <AdminSystemHealth />
        </TabsContent>

        {/* Configuración */}
        <TabsContent value='settings' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
              <CardDescription>Parámetros globales y configuración de la plataforma</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid gap-4'>
                <div className='border rounded-lg p-4'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h4 className='font-medium'>Modo de Mantenimiento</h4>
                      <p className='text-sm text-muted-foreground mt-1'>Coloca la plataforma en modo de mantenimiento</p>
                    </div>
                    <Button className='px-3 py-1 text-sm border rounded-md hover:bg-muted'>Desactivado</Button>
                  </div>
                </div>

                <div className='border rounded-lg p-4'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h4 className='font-medium'>Registro de Usuarios</h4>
                      <p className='text-sm text-muted-foreground mt-1'>Permite o restringe el registro de nuevos usuarios</p>
                    </div>
                    <Button className='px-3 py-1 text-sm border rounded-md hover:bg-muted'>Activado</Button>
                  </div>
                </div>

                <div className='border rounded-lg p-4'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h4 className='font-medium'>Notificaciones por Email</h4>
                      <p className='text-sm text-muted-foreground mt-1'>Habilita o deshabilita notificaciones por correo</p>
                    </div>
                    <Button className='px-3 py-1 text-sm border rounded-md hover:bg-muted'>Activado</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

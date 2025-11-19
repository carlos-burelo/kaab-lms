'use client'

import { AlertCircle, CheckCircle, Cpu, Database, HardDrive, Network } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function AdminSystemHealth() {
  const healthMetrics = [
    {
      name: 'Base de Datos',
      status: 'healthy',
      usage: 65,
      details: 'MySQL Server - 6.5GB / 10GB',
      icon: Database
    },
    {
      name: 'Almacenamiento',
      status: 'healthy',
      usage: 42,
      details: 'Storage - 420GB / 1TB',
      icon: HardDrive
    },
    {
      name: 'CPU',
      status: 'healthy',
      usage: 28,
      details: 'Utilización promedio',
      icon: Cpu
    },
    {
      name: 'Red',
      status: 'healthy',
      usage: 15,
      details: 'Ancho de banda utilizado',
      icon: Network
    }
  ]

  const logs = [
    {
      level: 'info',
      message: 'Backup diario completado exitosamente',
      timestamp: '2024-06-15 03:00:00'
    },
    {
      level: 'warning',
      message: 'Uso de CPU superior al 30% durante 5 minutos',
      timestamp: '2024-06-15 14:32:00'
    },
    {
      level: 'info',
      message: 'Actualización de seguridad aplicada',
      timestamp: '2024-06-14 22:15:00'
    },
    {
      level: 'info',
      message: 'Sincronización de base de datos completada',
      timestamp: '2024-06-14 12:00:00'
    }
  ]

  return (
    <div className='space-y-6'>
      {/* Métricas de Salud */}
      <div className='grid gap-4 md:grid-cols-2'>
        {healthMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.name}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>{metric.name}</CardTitle>
                <Icon className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center gap-2'>
                  {metric.status === 'healthy' ? (
                    <CheckCircle className='h-4 w-4 text-green-600' />
                  ) : (
                    <AlertCircle className='h-4 w-4 text-red-600' />
                  )}
                  <span className='text-sm'>{metric.status === 'healthy' ? 'Saludable' : 'Alerta'}</span>
                </div>
                <div>
                  <div className='flex justify-between text-sm mb-2'>
                    <span className='text-muted-foreground'>Uso</span>
                    <span className='font-medium'>{metric.usage}%</span>
                  </div>
                  <Progress value={metric.usage} className='h-2' />
                </div>
                <p className='text-xs text-muted-foreground'>{metric.details}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Logs del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Logs del Sistema</CardTitle>
          <CardDescription>Últimos eventos del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {logs.map((log, i) => (
              <div key={i} className='flex gap-4 pb-4 border-b last:border-0 last:pb-0'>
                <div>
                  {log.level === 'info' ? (
                    <Badge variant='outline' className='bg-blue-50'>
                      Info
                    </Badge>
                  ) : (
                    <Badge variant='destructive' className='bg-yellow-50 text-yellow-800'>
                      Advertencia
                    </Badge>
                  )}
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium'>{log.message}</p>
                  <p className='text-xs text-muted-foreground mt-1'>{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Uptime */}
      <Card>
        <CardHeader>
          <CardTitle>Disponibilidad</CardTitle>
          <CardDescription>Estado operacional de la plataforma</CardDescription>
        </CardHeader>
        <CardContent className='grid gap-6 md:grid-cols-2'>
          <div>
            <p className='text-sm text-muted-foreground'>Uptime Mensual</p>
            <p className='text-3xl font-bold mt-2'>99.98%</p>
            <p className='text-xs text-muted-foreground mt-2'>23 horas 59 minutos de inactividad</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Última Verificación</p>
            <p className='text-3xl font-bold mt-2'>Ahora</p>
            <p className='text-xs text-muted-foreground mt-2'>Sistema operativo correctamente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

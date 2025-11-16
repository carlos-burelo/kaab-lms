'use client'

import { AlertCircle, BookOpen, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface AdminDashboardStatsProps {
  isLoading: boolean
}

export function AdminDashboardStats({ isLoading }: AdminDashboardStatsProps) {
  const stats = [
    {
      title: 'Total de Usuarios',
      value: '1,234',
      description: '+5% del mes anterior',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Cursos Activos',
      value: '48',
      description: '+2 nuevos esta semana',
      icon: BookOpen,
      color: 'bg-green-500'
    },
    {
      title: 'Inscripciones',
      value: '5,678',
      description: '+12% del mes anterior',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'Alertas',
      value: '3',
      description: '2 pendientes de revisión',
      icon: AlertCircle,
      color: 'bg-red-500'
    }
  ]

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-[100px]' />
              <Skeleton className='h-8 w-8 rounded-lg' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-7 w-[60px]' />
              <Skeleton className='h-3 w-[150px] mt-2' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
              <div className={`${stat.color} p-2 rounded-lg`}>
                <Icon className='h-4 w-4 text-white' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
              <p className='text-xs text-muted-foreground mt-1'>{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

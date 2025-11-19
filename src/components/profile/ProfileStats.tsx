'use client'

import { Award, BookOpen, Brain, CheckCircle, Coins, Target, Trophy, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface ProfileStatsProps {
  stats: any
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  if (!stats) {
    return (
      <Card>
        <CardContent className='py-12 text-center text-muted-foreground'>No se pudieron cargar las estadísticas</CardContent>
      </Card>
    )
  }

  const completionRate = stats.totalCourses > 0 ? (stats.completedCourses / stats.totalCourses) * 100 : 0
  const quizPassRate = stats.totalQuizzes > 0 ? (stats.passedQuizzes / stats.totalQuizzes) * 100 : 0

  const statsCards = [
    {
      title: 'Cursos Inscritos',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'text-blue-500'
    },
    {
      title: 'Cursos Completados',
      value: stats.completedCourses,
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      title: 'Certificados',
      value: stats.certificates,
      icon: Award,
      color: 'text-yellow-500'
    },
    {
      title: 'Evaluaciones Aprobadas',
      value: `${stats.passedQuizzes}/${stats.totalQuizzes}`,
      icon: Brain,
      color: 'text-purple-500'
    },
    {
      title: 'Experiencia (XP)',
      value: stats.xp.toLocaleString(),
      icon: Zap,
      color: 'text-orange-500'
    },
    {
      title: 'Nivel',
      value: stats.level,
      icon: Target,
      color: 'text-indigo-500'
    },
    {
      title: 'Monedas',
      value: stats.coins.toLocaleString(),
      icon: Coins,
      color: 'text-amber-500'
    },
    {
      title: 'Insignias',
      value: stats.badges,
      icon: Trophy,
      color: 'text-pink-500'
    }
  ]

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
                <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>Tasa de Completación</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Cursos completados</span>
              <span className='font-medium'>{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} className='h-2' />
            <p className='text-xs text-muted-foreground'>
              {stats.completedCourses} de {stats.totalCourses} cursos completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendimiento en Evaluaciones</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Evaluaciones aprobadas</span>
              <span className='font-medium'>{quizPassRate.toFixed(1)}%</span>
            </div>
            <Progress value={quizPassRate} className='h-2' />
            <p className='text-xs text-muted-foreground'>
              {stats.passedQuizzes} de {stats.totalQuizzes} evaluaciones aprobadas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { BarChart3, BookOpen, Star, Target, TrendingUp, Users } from 'lucide-react'
import { getInstructorStats } from '@/actions/instructor.actions'
import { Card, CardContent } from '@/components/ui/card'

export async function StatsCards() {
  const result = await getInstructorStats()

  if (!result.success || !result.data) {
    return (
      <div className='p-4 border rounded-md bg-card text-center text-sm text-muted-foreground'>Error cargando estadísticas</div>
    )
  }

  const stats = result.data

  const statsItems = [
    {
      label: 'Cursos',
      value: stats.totalCourses,
      icon: <BookOpen className='w-5 h-5' />,
      color: 'bg-blue-500/10 text-blue-600'
    },
    {
      label: 'Publicados',
      value: stats.publishedCourses,
      icon: <TrendingUp className='w-5 h-5' />,
      color: 'bg-green-500/10 text-green-600'
    },
    {
      label: 'Estudiantes',
      value: stats.totalStudents,
      icon: <Users className='w-5 h-5' />,
      color: 'bg-purple-500/10 text-purple-600'
    },
    {
      label: 'Inscritos',
      value: stats.totalEnrollments,
      icon: <BarChart3 className='w-5 h-5' />,
      color: 'bg-orange-500/10 text-orange-600'
    },
    {
      label: 'Valoración',
      value: stats.averageRating.toFixed(1),
      icon: <Star className='w-5 h-5' />,
      color: 'bg-yellow-500/10 text-yellow-600'
    },
    {
      label: 'Activos (30d)',
      value: stats.activeStudentsThisMonth,
      icon: <Target className='w-5 h-5' />,
      color: 'bg-pink-500/10 text-pink-600'
    }
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {statsItems.map((stat, idx) => (
        <Card key={idx} className='overflow-hidden hover:shadow-lg transition-shadow'>
          <CardContent className='p-6'>
            <div className='flex items-start justify-between'>
              <div className='space-y-1'>
                <p className='text-sm font-medium text-muted-foreground'>{stat.label}</p>
                <p className='text-2xl font-bold'>{stat.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

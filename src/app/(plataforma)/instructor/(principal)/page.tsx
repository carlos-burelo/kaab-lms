import { getCourseAnalytics, getEnrollmentTrend, getRevenueData } from '@/actions/instructor.actions'
import { TaskList } from '@/components/tasks/TaskList'
import { Separator } from '@/components/ui/separator'
import { getSession } from '@/lib/auth'
import { CourseAnalyticsChart } from './components/CourseAnalyticsChart'
import { CourseFeatures } from './components/CourseFeatures'
import { EnrollmentChart } from './components/EnrollmentChart'
import { QuickActions } from './components/QuickActions'
import { RevenueChart } from './components/RevenueChart'
import { StatsCards } from './components/StatsCards'

export default async function Page() {
  const session = await getSession()

  // Obtener datos para gráficos
  const enrollmentTrendResult = await getEnrollmentTrend()
  const courseAnalyticsResult = await getCourseAnalytics()
  const revenueDataResult = await getRevenueData()

  return (
    <div className='p-4 space-y-6'>
      {/* Encabezado */}
      <div>
        <h1 className='font-semibold text-3xl'>
          Bienvenido de vuelta, <span className='text-primary'>{session?.name || 'Instructor'} 👋</span>
        </h1>
        <p className='text-muted-foreground text-sm mt-1'>Aquí está tu panel de control con todas las métricas</p>
      </div>

      {/* Acciones rápidas */}
      <QuickActions />

      <Separator />

      {/* Tarjetas de estadísticas */}
      <div>
        <h2 className='font-semibold text-lg mb-4'>Estadísticas</h2>
        <StatsCards />
      </div>

      {/* Gráficos principales */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Gráfico de inscripciones */}
        {enrollmentTrendResult.success && enrollmentTrendResult.data && <EnrollmentChart data={enrollmentTrendResult.data} />}

        {/* Gráfico de ingresos */}
        {revenueDataResult.success && revenueDataResult.data && <RevenueChart data={revenueDataResult.data} />}
      </div>

      {/* Análisis de cursos */}
      {courseAnalyticsResult.success && courseAnalyticsResult.data && <CourseAnalyticsChart data={courseAnalyticsResult.data} />}

      <Separator />

      {/* Sección de tareas */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <CourseFeatures />
        </div>
        <div>
          <h2 className='font-semibold text-lg mb-4'>Tareas Pendientes</h2>
          <TaskList />
        </div>
      </div>
    </div>
  )
}

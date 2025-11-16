'use client'

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { CourseAnalytics } from '@/actions/instructor.actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CourseAnalyticsChartProps {
  data: CourseAnalytics[]
}

export function CourseAnalyticsChart({ data }: CourseAnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Cursos</CardTitle>
          <CardDescription>No hay cursos publicados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center h-64 text-muted-foreground'>
            Publica tus cursos para ver el análisis
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.slice(0, 8).map((course) => ({
    name: course.title.length > 20 ? `${course.title.substring(0, 17)}...` : course.title,
    Inscritos: course.enrollments,
    Valoración: course.rating * 10, // Scale para visualizar mejor
    Reseñas: course.totalReviews
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de Cursos</CardTitle>
        <CardDescription>Rendimiento de tus cursos publicados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='w-full h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
              <XAxis
                dataKey='name'
                stroke='var(--muted-foreground)'
                style={{ fontSize: '0.75rem' }}
                angle={-45}
                textAnchor='end'
                height={100}
              />
              <YAxis stroke='var(--muted-foreground)' style={{ fontSize: '0.875rem' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem'
                }}
                formatter={(value: any) => {
                  if (typeof value === 'number' && value > 100) return [(value / 10).toFixed(1), 'Valoración']
                  return [value, '']
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey='Inscritos' fill='#3b82f6' radius={[8, 8, 0, 0]} />
              <Bar dataKey='Valoración' fill='#fbbf24' radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

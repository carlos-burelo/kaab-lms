'use client'

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { RevenueData } from '@/actions/instructor.actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface RevenueChartProps {
  data: RevenueData[]
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316' // orange
]

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Curso</CardTitle>
          <CardDescription>No hay cursos con precio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center h-64 text-muted-foreground'>
            Agrega precios a tus cursos para ver el análisis de ingresos
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const chartData = data.map((item) => ({
    name: item.title.length > 15 ? `${item.title.substring(0, 12)}...` : item.title,
    value: Math.round(item.revenue * 100) / 100,
    enrollments: item.enrollments
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos por Curso</CardTitle>
        <CardDescription>Total: ${totalRevenue.toFixed(2)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='w-full h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={chartData}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill='#8884d8'
                dataKey='value'
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem'
                }}
                formatter={(value: any) => {
                  if (typeof value === 'number') return [`$${value.toFixed(2)}`, 'Ingresos']
                  return [value, 'Ingresos']
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className='mt-6 space-y-2'>
          <h4 className='font-semibold text-sm mb-4'>Desglose por curso:</h4>
          <div className='grid grid-cols-2 gap-2'>
            {data.map((item, idx) => (
              <div key={item.courseId} className='flex items-center gap-2 text-sm'>
                <div className='w-3 h-3 rounded-full' style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <div className='flex-1'>
                  <p className='text-muted-foreground truncate'>{item.title}</p>
                  <p className='font-medium'>${item.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

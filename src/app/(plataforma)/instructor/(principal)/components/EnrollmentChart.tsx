'use client'

import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { EnrollmentTrend } from '@/actions/instructor.actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface EnrollmentChartProps {
  data: EnrollmentTrend[]
}

export function EnrollmentChart({ data }: EnrollmentChartProps) {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('es-ES', {
          month: 'short',
          day: 'numeric'
        })
      })),
    [data]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia de Inscripciones</CardTitle>
        <CardDescription>Últimos 30 días</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='w-full h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id='colorEnrollments' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.8} />
                  <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='colorCumulative' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#10b981' stopOpacity={0.8} />
                  <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
              <XAxis dataKey='date' stroke='var(--muted-foreground)' style={{ fontSize: '0.875rem' }} />
              <YAxis stroke='var(--muted-foreground)' style={{ fontSize: '0.875rem' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem'
                }}
                formatter={(value) => [value, '']}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Area
                type='monotone'
                dataKey='enrollments'
                stroke='#3b82f6'
                fillOpacity={1}
                fill='url(#colorEnrollments)'
                name='Nuevas inscripciones'
              />
              <Line
                type='monotone'
                dataKey='cumulative'
                stroke='#10b981'
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name='Total acumulado'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

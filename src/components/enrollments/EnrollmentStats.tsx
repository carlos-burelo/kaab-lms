'use client'

import { CheckCircle2, Clock, Loader2, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getCourseEnrollmentStats } from '@/actions/enrollment.actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Stats {
  totalEnrollments: number
  activeEnrollments: number
  completedEnrollments: number
  averageProgress: number
  totalTimeMinutes: number
  enrollmentsByDate: Record<string, number>
  completionRate: number
}

interface EnrollmentStatsProps {
  courseId: string
  initialStats?: Stats
}

export function EnrollmentStats({ courseId, initialStats }: EnrollmentStatsProps) {
  const [_isPending, startTransition] = useTransition()
  const [stats, setStats] = useState<Stats | undefined>(initialStats)

  useEffect(() => {
    if (!initialStats) {
      startTransition(async () => {
        const result = await getCourseEnrollmentStats(courseId)
        if (result.success && result.data) {
          setStats(result.data)
        }
      })
    }
  }, [courseId, initialStats])

  if (!stats) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  const chartData = Object.entries(stats.enrollmentsByDate).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    enrollments: count
  }))

  const statusData = [
    { name: 'Completed', value: stats.completedEnrollments, color: '#10b981' },
    { name: 'Active', value: stats.activeEnrollments, color: '#3b82f6' },
    {
      name: 'Inactive',
      value: stats.totalEnrollments - stats.completedEnrollments - stats.activeEnrollments,
      color: '#9ca3af'
    }
  ]

  return (
    <div className='space-y-6'>
      {/* KPI Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Users className='h-4 w-4 text-blue-600' />
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>{stats.totalEnrollments}</p>
            <p className='text-xs text-muted-foreground mt-1'>students enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4 text-green-600' />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>{stats.completionRate.toFixed(1)}%</p>
            <p className='text-xs text-muted-foreground mt-1'>{stats.completedEnrollments} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-purple-600' />
              Avg Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>{stats.averageProgress.toFixed(1)}%</p>
            <p className='text-xs text-muted-foreground mt-1'>across all students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Clock className='h-4 w-4 text-orange-600' />
              Total Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>{Math.round(stats.totalTimeMinutes / 60)}h</p>
            <p className='text-xs text-muted-foreground mt-1'>spent learning</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Enrollment Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Trend</CardTitle>
            <CardDescription>New enrollments over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis dataKey='date' stroke='#6b7280' />
                <YAxis stroke='#6b7280' />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line type='monotone' dataKey='enrollments' stroke='#3b82f6' strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Enrollment status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

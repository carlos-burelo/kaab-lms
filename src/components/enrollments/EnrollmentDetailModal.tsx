'use client'

import { AlertCircle, Award, CheckCircle2, Clock, Mail, TrendingUp } from 'lucide-react'
import { useTransition } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Enrollment {
  id: string
  userId: string
  courseId: string
  progress: number
  lastLessonId: string | null
  lastAccessed: Date | null
  totalTimeMinutes: number
  isCompleted: boolean
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    email: string
    profile?: {
      name: string | null
    }
  }
}

interface EnrollmentDetailModalProps {
  enrollment: Enrollment
  onClose: () => void
}

export function EnrollmentDetailModal({ enrollment, onClose }: EnrollmentDetailModalProps) {
  const [isPending, _startTransition] = useTransition()

  const handleContactStudent = () => {
    // Open email client or show email form
    window.location.href = `mailto:${enrollment.user.email}`
  }

  const formatDate = (date: Date | null | string) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (enrollment: Enrollment) => {
    if (enrollment.isCompleted) {
      return 'bg-green-100 text-green-800'
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const isActive = enrollment.lastAccessed && new Date(enrollment.lastAccessed) > thirtyDaysAgo

    if (isActive) {
      return 'bg-blue-100 text-blue-800'
    }

    return 'bg-gray-100 text-gray-800'
  }

  const getStatus = (enrollment: Enrollment): string => {
    if (enrollment.isCompleted) return 'Completed'

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const isActive = enrollment.lastAccessed && new Date(enrollment.lastAccessed) > thirtyDaysAgo

    if (isActive) return 'Active'
    return 'Inactive'
  }

  const daysEnrolled = Math.floor((Date.now() - new Date(enrollment.createdAt).getTime()) / (1000 * 60 * 60 * 24))

  const hoursSpent = Math.round(enrollment.totalTimeMinutes / 60)

  const isAtRisk = !enrollment.isCompleted && enrollment.progress < 50

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Enrollment Details</DialogTitle>
          <DialogDescription>Student progress and activity information</DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Student Info */}
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div>
                  <CardTitle className='text-xl'>{enrollment.user.profile?.name || 'Unknown'}</CardTitle>
                  <CardDescription className='mt-1'>{enrollment.user.email}</CardDescription>
                </div>
                <Badge className={getStatusColor(enrollment)}>{getStatus(enrollment)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isAtRisk && (
                <Alert variant='destructive' className='mb-4'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>This student is at risk of not completing the course</AlertDescription>
                </Alert>
              )}

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Enrolled</p>
                  <p className='font-medium'>{formatDate(enrollment.createdAt)}</p>
                  <p className='text-xs text-muted-foreground'>{daysEnrolled} days ago</p>
                </div>

                {enrollment.completedAt && (
                  <div>
                    <p className='text-sm text-muted-foreground'>Completed</p>
                    <p className='font-medium'>{formatDate(enrollment.completedAt)}</p>
                  </div>
                )}

                <div>
                  <p className='text-sm text-muted-foreground'>Last Access</p>
                  <p className='font-medium'>{formatDate(enrollment.lastAccessed)}</p>
                </div>

                <div>
                  <p className='text-sm text-muted-foreground'>Time Spent</p>
                  <p className='font-medium'>
                    {hoursSpent}h {enrollment.totalTimeMinutes % 60}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div>
                  <div className='flex justify-between mb-2'>
                    <span className='text-sm font-medium'>Course Completion</span>
                    <span className='text-sm font-bold'>{enrollment.progress}%</span>
                  </div>
                  <div className='w-full bg-muted rounded-full h-3'>
                    <div
                      className={`h-3 rounded-full transition-all ${
                        enrollment.progress >= 75
                          ? 'bg-green-500'
                          : enrollment.progress >= 50
                            ? 'bg-yellow-500'
                            : enrollment.progress >= 25
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                      }`}
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>

                {enrollment.progress === 100 && (
                  <div className='flex items-center gap-2 text-green-600 mt-4'>
                    <CheckCircle2 className='h-5 w-5' />
                    <span className='font-medium'>Course completed successfully</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center gap-2'>
                <Clock className='h-5 w-5' />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-3 gap-4'>
                <div className='text-center'>
                  <p className='text-2xl font-bold text-blue-600'>{hoursSpent}h</p>
                  <p className='text-sm text-muted-foreground'>Time Spent</p>
                </div>

                <div className='text-center'>
                  <p className='text-2xl font-bold text-purple-600'>{daysEnrolled}</p>
                  <p className='text-sm text-muted-foreground'>Days Enrolled</p>
                </div>

                <div className='text-center'>
                  <p className='text-2xl font-bold text-green-600'>{enrollment.progress}%</p>
                  <p className='text-sm text-muted-foreground'>Completion</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className='flex gap-2'>
            <Button onClick={handleContactStudent} variant='outline' className='flex-1'>
              <Mail className='h-4 w-4 mr-2' />
              Email Student
            </Button>

            <Button disabled={isPending} className='flex-1'>
              <Award className='h-4 w-4 mr-2' />
              Award Badge
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

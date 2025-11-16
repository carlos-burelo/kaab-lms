'use client'

import { AlertCircle, Award, CheckCircle2, Clock, Eye, Loader2, Mail } from 'lucide-react'
import { useState, useTransition } from 'react'
import { completeEnrollment, getEnrollments, searchEnrollments } from '@/actions/enrollment.actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EnrollmentDetailModal } from './EnrollmentDetailModal'

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

interface EnrollmentsListResult {
  enrollments: Enrollment[]
  total: number
  limit: number
  offset: number
}

interface EnrollmentsListProps {
  courseId: string
  initialData: EnrollmentsListResult
}

export function EnrollmentsList({ courseId, initialData }: EnrollmentsListProps) {
  const [isPending, startTransition] = useTransition()
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialData.enrollments)
  const [total, setTotal] = useState(initialData.total)
  const [offset, setOffset] = useState(0)
  const limit = 50

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'createdAt' | 'progress' | 'lastAccessed' | 'name'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedEnrollments, setSelectedEnrollments] = useState<Set<string>>(new Set())
  const [selectedDetail, setSelectedDetail] = useState<Enrollment | null>(null)
  const [completeConfirm, setCompleteConfirm] = useState<string | null>(null)

  const handleLoadMore = () => {
    startTransition(async () => {
      setError(null)
      const result = await getEnrollments({
        courseId,
        offset: offset + limit,
        limit,
        status: statusFilter,
        search: searchQuery || undefined,
        sortBy,
        sortOrder
      })

      if (result.success && result.data) {
        setEnrollments([...enrollments, ...result.data.enrollments])
        setTotal(result.data.total)
        setOffset(offset + limit)
      } else {
        setError(result.error || 'Failed to load enrollments')
      }
    })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setOffset(0)

    if (!query.trim()) {
      startTransition(async () => {
        const result = await getEnrollments({
          courseId,
          offset: 0,
          limit,
          status: statusFilter,
          sortBy,
          sortOrder
        })

        if (result.success && result.data) {
          setEnrollments(result.data.enrollments)
          setTotal(result.data.total)
        }
      })
      return
    }

    startTransition(async () => {
      const result = await searchEnrollments(courseId, query)

      if (result.success && result.data) {
        setEnrollments(result.data)
        setTotal(result.data.length)
      } else {
        setError(result.error || 'Search failed')
      }
    })
  }

  const handleFilterStatus = (status: string) => {
    setStatusFilter(status as any)
    setOffset(0)
    setSelectedEnrollments(new Set())

    startTransition(async () => {
      setError(null)
      const result = await getEnrollments({
        courseId,
        offset: 0,
        limit,
        status: status as any,
        search: searchQuery || undefined,
        sortBy,
        sortOrder
      })

      if (result.success && result.data) {
        setEnrollments(result.data.enrollments)
        setTotal(result.data.total)
      } else {
        setError(result.error || 'Failed to load enrollments')
      }
    })
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field as any)
      setSortOrder('desc')
    }
    setOffset(0)

    startTransition(async () => {
      const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : sortBy === field ? 'asc' : 'desc'
      const result = await getEnrollments({
        courseId,
        offset: 0,
        limit,
        status: statusFilter,
        search: searchQuery || undefined,
        sortBy: field as any,
        sortOrder: newSortOrder
      })

      if (result.success && result.data) {
        setEnrollments(result.data.enrollments)
        setTotal(result.data.total)
      }
    })
  }

  const handleSelectEnrollment = (enrollmentId: string, checked: boolean) => {
    const newSelected = new Set(selectedEnrollments)
    if (checked) {
      newSelected.add(enrollmentId)
    } else {
      newSelected.delete(enrollmentId)
    }
    setSelectedEnrollments(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEnrollments(new Set(enrollments.map((e) => e.id)))
    } else {
      setSelectedEnrollments(new Set())
    }
  }

  const handleCompleteEnrollment = (enrollmentId: string) => {
    startTransition(async () => {
      const result = await completeEnrollment(enrollmentId)

      if (result.success) {
        setEnrollments(
          enrollments.map((e) =>
            e.id === enrollmentId
              ? {
                  ...e,
                  isCompleted: true,
                  completedAt: new Date(),
                  progress: 100
                }
              : e
          )
        )
        setSuccess('Enrollment marked as completed')
        setCompleteConfirm(null)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error || 'Failed to complete enrollment')
      }
    })
  }

  const getStatusBadge = (enrollment: Enrollment) => {
    if (enrollment.isCompleted) {
      return <Badge className='bg-green-600'>Completed</Badge>
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const isActive = enrollment.lastAccessed && new Date(enrollment.lastAccessed) > thirtyDaysAgo

    if (isActive) {
      return <Badge className='bg-blue-600'>Active</Badge>
    }

    return <Badge variant='secondary'>Inactive</Badge>
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500'
    if (progress >= 50) return 'bg-yellow-500'
    if (progress >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      year: '2-digit',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className='space-y-6'>
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className='border-green-200 bg-green-50'>
          <AlertDescription className='text-green-800'>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Course Enrollments</CardTitle>
          <CardDescription>Manage and monitor student enrollments</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Filters and Search */}
          <div className='flex gap-4 flex-col sm:flex-row'>
            <Input
              placeholder='Search by name or email...'
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              disabled={isPending}
              className='flex-1'
            />

            <Select value={statusFilter} onValueChange={handleFilterStatus} disabled={isPending}>
              <SelectTrigger className='w-full sm:w-48'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='completed'>Completed</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedEnrollments.size > 0 && (
            <div className='flex items-center justify-between bg-muted p-4 rounded-lg'>
              <span className='text-sm font-medium'>{selectedEnrollments.size} selected</span>
              <div className='flex gap-2'>
                <Button size='sm' variant='outline' disabled={isPending}>
                  <Mail className='h-4 w-4 mr-2' />
                  Email
                </Button>
                <Button size='sm' variant='outline' disabled={isPending}>
                  <Award className='h-4 w-4 mr-2' />
                  Award
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-12'>
                    <Checkbox
                      checked={selectedEnrollments.size === enrollments.length && enrollments.length > 0}
                      onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                      disabled={isPending}
                    />
                  </TableHead>
                  <TableHead className='cursor-pointer' onClick={() => handleSort('name')}>
                    Student {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </TableHead>
                  <TableHead className='cursor-pointer' onClick={() => handleSort('progress')}>
                    Progress {sortBy === 'progress' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </TableHead>
                  <TableHead className='cursor-pointer' onClick={() => handleSort('lastAccessed')}>
                    Last Access {sortBy === 'lastAccessed' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </TableHead>
                  <TableHead>Time Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>
                      No enrollments found
                    </TableCell>
                  </TableRow>
                ) : (
                  enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedEnrollments.has(enrollment.id)}
                          onCheckedChange={(checked) => handleSelectEnrollment(enrollment.id, checked as boolean)}
                          disabled={isPending}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='font-medium'>{enrollment.user.profile?.name || 'Unknown'}</p>
                          <p className='text-sm text-muted-foreground'>{enrollment.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-2'>
                          <div className='w-full bg-muted rounded-full h-2'>
                            <div
                              className={`h-2 rounded-full ${getProgressColor(enrollment.progress)}`}
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                          <span className='text-sm font-medium'>{enrollment.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className='text-sm'>{formatDate(enrollment.lastAccessed)}</TableCell>
                      <TableCell className='text-sm'>
                        <div className='flex items-center gap-1'>
                          <Clock className='h-4 w-4 text-muted-foreground' />
                          {Math.round(enrollment.totalTimeMinutes / 60)}h
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(enrollment)}</TableCell>
                      <TableCell>
                        <Button size='sm' variant='ghost' onClick={() => setSelectedDetail(enrollment)} disabled={isPending}>
                          <Eye className='h-4 w-4' />
                        </Button>
                        {!enrollment.isCompleted && (
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => setCompleteConfirm(enrollment.id)}
                            disabled={isPending}
                          >
                            <CheckCircle2 className='h-4 w-4' />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Load More */}
          {offset + limit < total && (
            <div className='flex justify-center'>
              <Button onClick={handleLoadMore} disabled={isPending} variant='outline'>
                {isPending && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
                Load More ({offset + limit} of {total})
              </Button>
            </div>
          )}

          {enrollments.length > 0 && (
            <p className='text-sm text-muted-foreground text-center'>
              Showing {enrollments.length} of {total} enrollments
            </p>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedDetail && <EnrollmentDetailModal enrollment={selectedDetail} onClose={() => setSelectedDetail(null)} />}

      {/* Complete Confirmation */}
      <AlertDialog open={!!completeConfirm} onOpenChange={(open) => !open && setCompleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Completed</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to mark this enrollment as completed?</AlertDialogDescription>
          </AlertDialogHeader>
          <div className='flex gap-3'>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => completeConfirm && handleCompleteEnrollment(completeConfirm)}
              disabled={isPending}
              className='bg-green-600 hover:bg-green-700'
            >
              {isPending && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
              Complete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

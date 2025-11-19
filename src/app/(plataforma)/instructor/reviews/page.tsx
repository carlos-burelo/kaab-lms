'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Star } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { getMyCourses, getReviews } from '@/actions/instructor/course.actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Review = {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  user: { profile: { name: string; imageUrl: string | null } }
  course: { title: string; id: string }
}

type Course = {
  id: string
  title: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [selectedRating, setSelectedRating] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const [reviewsResult, coursesResult] = await Promise.all([getReviews(undefined as any), getMyCourses(undefined as any)])

    if (reviewsResult.success && reviewsResult.data) {
      setReviews(reviewsResult.data as any)
    }

    if (coursesResult.success && coursesResult.data) {
      setCourses(coursesResult.data as any)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredReviews = reviews.filter((review) => {
    const courseMatch = selectedCourse === 'all' || review.course.id === selectedCourse
    const ratingMatch = selectedRating === 'all' || review.rating.toString() === selectedRating
    return courseMatch && ratingMatch
  })

  const averageRating =
    filteredReviews.length > 0
      ? (filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length).toFixed(1)
      : '0.0'

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: filteredReviews.filter((r) => r.rating === rating).length,
    percentage: filteredReviews.length
      ? (filteredReviews.filter((r) => r.rating === rating).length / filteredReviews.length) * 100
      : 0
  }))

  if (loading) {
    return <div className='p-4'>Cargando reviews...</div>
  }

  return (
    <>
      <header className='border-b border-border p-4'>
        <h1 className='text-2xl font-bold text-foreground'>Reseñas de Cursos</h1>
        <p className='text-sm text-muted-foreground'>Revisa el feedback de tus estudiantes</p>
      </header>
      <main className='p-4 space-y-6'>
        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium'>Calificación Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold flex items-center gap-2'>
                {averageRating}
                <Star className='h-6 w-6 fill-yellow-400 text-yellow-400' />
              </div>
              <p className='text-xs text-muted-foreground mt-1'>De {filteredReviews.length} reseñas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium'>Total de Reseñas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-bold'>{filteredReviews.length}</div>
              <p className='text-xs text-muted-foreground mt-1'>
                En {selectedCourse === 'all' ? 'todos los cursos' : 'curso seleccionado'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium'>Distribución</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-1'>
                {ratingDistribution.map((item) => (
                  <div key={item.rating} className='flex items-center gap-2 text-sm'>
                    <span className='w-3'>{item.rating}</span>
                    <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                    <div className='flex-1 bg-muted rounded-full h-2'>
                      <div className='bg-yellow-400 h-2 rounded-full' style={{ width: `${item.percentage}%` }} />
                    </div>
                    <span className='text-muted-foreground w-8 text-right'>{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtra las reseñas por curso y calificación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <div className='text-sm font-medium mb-2 block'>Curso</div>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder='Todos los cursos' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todos los cursos</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className='text-sm font-medium mb-2 block'>Calificación</div>
                <Select value={selectedRating} onValueChange={setSelectedRating}>
                  <SelectTrigger>
                    <SelectValue placeholder='Todas las calificaciones' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todas las calificaciones</SelectItem>
                    <SelectItem value='5'>5 estrellas</SelectItem>
                    <SelectItem value='4'>4 estrellas</SelectItem>
                    <SelectItem value='3'>3 estrellas</SelectItem>
                    <SelectItem value='2'>2 estrellas</SelectItem>
                    <SelectItem value='1'>1 estrella</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className='space-y-4'>
          {filteredReviews.length === 0 ? (
            <Card>
              <CardContent className='p-8 text-center text-muted-foreground'>
                No hay reseñas con los filtros seleccionados
              </CardContent>
            </Card>
          ) : (
            filteredReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className='p-6'>
                  <div className='flex items-start gap-4'>
                    <Avatar>
                      <AvatarImage src={review.user.profile.imageUrl || undefined} />
                      <AvatarFallback>{review.user.profile.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between mb-2'>
                        <div>
                          <p className='font-medium'>{review.user.profile.name}</p>
                          <p className='text-sm text-muted-foreground'>{review.course.title}</p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Badge variant='outline'>
                            {review.rating} <Star className='h-3 w-3 ml-1' />
                          </Badge>
                          <span className='text-sm text-muted-foreground'>
                            {format(new Date(review.createdAt), 'dd MMM yyyy', {
                              locale: es
                            })}
                          </span>
                        </div>
                      </div>
                      <div className='flex gap-1 mb-2'>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                      {review.comment && <p className='text-sm text-foreground mt-2'>{review.comment}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </>
  )
}

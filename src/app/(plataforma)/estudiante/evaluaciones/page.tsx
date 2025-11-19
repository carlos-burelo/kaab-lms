import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getQuizAttempts } from '@/actions/student/quiz.actions'
import { QuizHistoryList } from '@/components/quiz/QuizHistoryList'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Brain } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mis Evaluaciones',
  description: 'Historial de evaluaciones y resultados'
}

export default async function QuizHistoryPage() {
  const attemptsResult = await getQuizAttempts({})
  const attempts = attemptsResult.success ? (attemptsResult.data as any) : []

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Mis Evaluaciones</h1>
        <p className='text-muted-foreground'>Historial de todas tus evaluaciones y resultados</p>
      </div>

      <Suspense fallback={<QuizHistorySkeleton />}>
        <QuizHistoryList attempts={attempts || []} />
      </Suspense>
    </div>
  )
}

function QuizHistorySkeleton() {
  return (
    <div className='space-y-4'>
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div className='space-y-2 flex-1'>
                <Skeleton className='h-5 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
              </div>
              <Skeleton className='h-16 w-16 rounded-full' />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

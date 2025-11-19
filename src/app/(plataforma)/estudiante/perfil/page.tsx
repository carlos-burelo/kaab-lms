import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getProfile, getLearningStats } from '@/actions/profile.actions'
import { getSession } from '@/lib/auth'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { ProfileStats } from '@/components/profile/ProfileStats'
import { Card, CardContent, CardHeader, } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Mi Perfil',
  description: 'Gestiona tu perfil y configuración'
}

export default async function ProfilePage() {
  const user = await getSession()
  if (!user?.id) {
    redirect('/auth/login')
  }

  const [profileResult, statsResult] = await Promise.all([getProfile(), getLearningStats()])

  const profile = profileResult.success ? profileResult.data : null
  const stats = statsResult.success ? statsResult.data : null

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Mi Perfil</h1>
        <p className='text-muted-foreground'>Gestiona tu información personal y configuración</p>
      </div>

      <Tabs defaultValue='profile' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='profile'>Perfil</TabsTrigger>
          <TabsTrigger value='stats'>Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value='profile' className='space-y-4'>
          <Suspense fallback={<ProfileSkeleton />}>
            <ProfileForm initialProfile={profile} userEmail={user.email || ''} />
          </Suspense>
        </TabsContent>

        <TabsContent value='stats' className='space-y-4'>
          <Suspense fallback={<StatsSkeleton />}>
            <ProfileStats stats={stats} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-1/3' />
        <Skeleton className='h-4 w-2/3' />
      </CardHeader>
      <CardContent className='space-y-4'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-10 w-full' />
      </CardContent>
    </Card>
  )
}

function StatsSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {[...Array(8)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className='h-4 w-1/2' />
            <Skeleton className='h-8 w-1/3' />
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

import { Metadata } from 'next'
import { Suspense } from 'react'
import { getConversations } from '@/actions/message.actions'
import { MessagesInterface } from '@/components/messages/MessagesInterface'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Mensajes',
  description: 'Centro de mensajes'
}

export default async function MessagesPage() {
  const conversationsResult = await getConversations({ limit: 50, skip: 0 })
  const conversations = conversationsResult.success ? (conversationsResult.data as any) : []

  return (
    <div className='container mx-auto py-6 h-[calc(100vh-8rem)]'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Mensajes</h1>
        <p className='text-muted-foreground'>Conversa con instructores y compañeros</p>
      </div>

      <Suspense fallback={<MessagesSkeleton />}>
        <MessagesInterface initialConversations={conversations || []} />
      </Suspense>
    </div>
  )
}

function MessagesSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 h-full'>
      <div className='md:col-span-1 space-y-4'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex items-center gap-3 p-4 border rounded-lg'>
            <Skeleton className='h-10 w-10 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
            </div>
          </div>
        ))}
      </div>
      <div className='md:col-span-2 border rounded-lg p-6'>
        <Skeleton className='h-full w-full' />
      </div>
    </div>
  )
}

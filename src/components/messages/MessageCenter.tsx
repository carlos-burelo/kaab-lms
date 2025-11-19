'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { MessageSquare, Send } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getConversationMessages, getConversations, sendMessage } from '@/actions/message.actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'

export function MessageCenter() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { register, handleSubmit, reset } = useForm()

  const loadConversations = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await getConversations()
      if (result.success && result.data) {
        setConversations(result.data)
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las conversaciones'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const loadMessages = useCallback(
    async (conversationId: string) => {
      try {
        const result = await getConversationMessages(conversationId)
        if (result.success && result.data) {
          setMessages(result.data.reverse())
        }
      } catch (_error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los mensajes'
        })
      }
    },
    [toast]
  )

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation, loadMessages])

  async function onSendMessage(data: any) {
    if (!selectedConversation) return

    try {
      const result = await sendMessage({
        conversationId: selectedConversation.id,
        message: data.message
      })

      if (result.success) {
        reset()
        setMessages((prev) => [...prev, result.data])
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error
        })
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Error al enviar mensaje'
      })
    }
  }

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = conv.userId === selectedConversation?.id ? conv.recipient : conv.user
    return otherUser.profile?.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (isLoading) {
    return (
      <Card className='w-full h-96'>
        <CardContent className='flex items-center justify-center h-full'>
          <p className='text-muted-foreground'>Cargando...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 h-96'>
      {/* Lista de Conversaciones */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg flex items-center gap-2'>
            <MessageSquare className='h-4 w-4' />
            Mensajes
          </CardTitle>
          <div className='mt-3'>
            <Input placeholder='Buscar...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='h-8' />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className='h-80'>
            <div className='space-y-2'>
              {filteredConversations.length === 0 ? (
                <p className='text-xs text-muted-foreground text-center py-4'>No hay conversaciones</p>
              ) : (
                filteredConversations.map((conv) => {
                  const otherUser = conv.userId === selectedConversation?.id ? conv.recipient : conv.user
                  const unreadCount = conv.messages.filter((m: any) => !m.isRead && m.recipientId !== conv.userId).length

                  return (
                    <button
                      type='button'
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedConversation?.id === conv.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                    >
                      <div className='flex items-center gap-2'>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage src={otherUser.profile?.imageUrl} />
                          <AvatarFallback>{otherUser.profile?.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium truncate'>{otherUser.profile?.name}</p>
                          <p className='text-xs opacity-70 truncate'>{conv.messages[0]?.content || 'Sin mensajes'}</p>
                        </div>
                        {unreadCount > 0 && (
                          <span className='inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white'>
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Área de Mensajes */}
      {selectedConversation ? (
        <Card className='col-span-1 md:col-span-2 flex flex-col'>
          {/* Header */}
          <CardHeader className='pb-3 border-b'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage src={selectedConversation.recipient?.profile?.imageUrl} />
                  <AvatarFallback>{selectedConversation.recipient?.profile?.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-medium'>{selectedConversation.recipient?.profile?.name}</p>
                  <p className='text-xs text-muted-foreground'>{selectedConversation.recipient?.email}</p>
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Mensajes */}
          <CardContent className='flex-1 overflow-y-auto p-4'>
            <ScrollArea className='h-full'>
              <div className='space-y-4'>
                {messages.length === 0 ? (
                  <p className='text-center text-sm text-muted-foreground'>Inicia la conversación</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className='flex gap-2'>
                      <Avatar className='h-6 w-6 mt-1'>
                        <AvatarImage src={msg.sender?.profile?.imageUrl} />
                        <AvatarFallback>{msg.sender?.profile?.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className='flex-1'>
                        <p className='text-xs font-medium'>{msg.sender?.profile?.name}</p>
                        <div className='bg-muted rounded-lg p-2 mt-1'>
                          <p className='text-sm'>{msg.content}</p>
                        </div>
                        <p className='text-xs text-muted-foreground mt-1'>
                          {formatDistanceToNow(new Date(msg.createdAt), {
                            addSuffix: true,
                            locale: es
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>

          {/* Input */}
          <div className='border-t p-3'>
            <form onSubmit={handleSubmit(onSendMessage)} className='flex gap-2'>
              <Input placeholder='Escribe un mensaje...' {...register('message', { required: true })} className='text-sm' />
              <Button type='submit' size='sm' variant='outline'>
                <Send className='h-4 w-4' />
              </Button>
            </form>
          </div>
        </Card>
      ) : (
        <Card className='col-span-1 md:col-span-2 flex items-center justify-center'>
          <CardContent className='text-center text-muted-foreground'>
            <MessageSquare className='h-8 w-8 mx-auto mb-2 opacity-50' />
            <p>Selecciona una conversación para continuar</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

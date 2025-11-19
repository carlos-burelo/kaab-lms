'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send } from 'lucide-react'
import { getConversations, getConversationDetail, sendMessage } from '@/actions/instructor/messaging.actions'
import { toast } from 'sonner'

type Conversation = {
  id: string
  initiator: { id: string; profile: { name: string; imageUrl: string } }
  receiver: { id: string; profile: { name: string; imageUrl: string } }
  lastMessage: string
  lastMessageAt: Date
  unreadInitiator: number
  unreadReceiver: number
}

type Message = {
  id: string
  content: string
  createdAt: Date
  sender: { id: string; profile: { name: string; imageUrl: string } }
}

export function MessagingInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    const result = await getConversations({})
    if (result.success && result.data) {
      setConversations(result.data as any)
    }
    setLoading(false)
  }

  const loadMessages = async (conversationId: string) => {
    const result = await getConversationDetail({ conversationId })
    if (result.success && result.data) {
      const conv = result.data as any
      setMessages(conv.messages || [])
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const result = await sendMessage({
      conversationId: selectedConversation,
      content: newMessage,
      fileId: null
    })

    if (result.success) {
      setNewMessage('')
      loadMessages(selectedConversation)
      loadConversations()
    } else {
      toast.error('Error al enviar mensaje')
    }
  }

  if (loading) {
    return <div className='p-4'>Cargando conversaciones...</div>
  }

  return (
    <div className='flex h-[calc(100vh-12rem)]'>
      {/* Lista de conversaciones */}
      <div className='w-80 border-r'>
        <ScrollArea className='h-full'>
          {conversations.length === 0 ? (
            <div className='p-4 text-center text-muted-foreground'>
              No hay conversaciones
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUser =
                conv.initiator.id === conv.initiator.id ? conv.receiver : conv.initiator
              return (
                <div
                  key={conv.id}
                  className={`p-4 border-b cursor-pointer hover:bg-muted ${selectedConversation === conv.id ? 'bg-muted' : ''}`}
                  onClick={() => setSelectedConversation(conv.id)}
                >
                  <div className='flex items-center gap-3'>
                    <Avatar>
                      <AvatarImage src={otherUser.profile?.imageUrl} />
                      <AvatarFallback>{otherUser.profile?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium truncate'>{otherUser.profile?.name}</p>
                      <p className='text-sm text-muted-foreground truncate'>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </ScrollArea>
      </div>

      {/* Área de mensajes */}
      <div className='flex-1 flex flex-col'>
        {selectedConversation ? (
          <>
            <ScrollArea className='flex-1 p-4'>
              <div className='space-y-4'>
                {messages.map((message) => (
                  <div key={message.id} className='flex items-start gap-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={message.sender.profile?.imageUrl} />
                      <AvatarFallback>{message.sender.profile?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-sm'>
                          {message.sender.profile?.name}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {format(new Date(message.createdAt), 'HH:mm', { locale: es })}
                        </span>
                      </div>
                      <p className='text-sm mt-1'>{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className='border-t p-4'>
              <div className='flex gap-2'>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder='Escribe un mensaje...'
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Send className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center text-muted-foreground'>
            Selecciona una conversación para comenzar
          </div>
        )}
      </div>
    </div>
  )
}

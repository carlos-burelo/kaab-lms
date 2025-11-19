'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { MessageSquare, MoreVertical, Search, Send, Trash2, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  deleteConversation,
  getConversationMessages,
  getOrCreateConversation,
  markConversationAsRead,
  searchUsersForChat,
  sendMessage
} from '@/actions/message.actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type Conversation = {
  id: string
  initiatorId: string
  receiverId: string
  lastMessage?: string | null
  lastMessageAt?: Date | null
  unreadInitiator: number
  unreadReceiver: number
  initiator: {
    id: string
    email: string
    profile?: {
      name?: string | null
      imageUrl?: string | null
    } | null
  }
  receiver: {
    id: string
    email: string
    profile?: {
      name?: string | null
      imageUrl?: string | null
    } | null
  }
}

type Message = {
  id: string
  conversationId: string
  senderId: string
  content: string
  isRead: boolean
  createdAt: Date
  sender: {
    id: string
    email: string
    profile?: {
      name?: string | null
      imageUrl?: string | null
    } | null
  }
}

interface MessagesInterfaceProps {
  initialConversations: Conversation[]
}

export function MessagesInterface({ initialConversations }: MessagesInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newChatOpen, setNewChatOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  const loadConversationMessages = async (conversationId: string) => {
    setIsLoading(true)
    const result = await getConversationMessages(conversationId, 50, 0)
    if (result.success) {
      setMessages(result.data || [])
    }
    setIsLoading(false)
  }

  const handleConversationSelect = async (conversation: Conversation) => {
    setSelectedConversation(conversation)
    await loadConversationMessages(conversation.id)
    await markConversationAsRead(conversation.id)
    router.refresh()
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setIsLoading(true)
    const otherUserId =
      selectedConversation.initiatorId === selectedConversation.initiator.id
        ? selectedConversation.receiverId
        : selectedConversation.initiatorId

    const result = await sendMessage({
      conversationId: selectedConversation.id,
      message: newMessage.trim()
    })

    if (result.success) {
      setNewMessage('')
      await loadConversationMessages(selectedConversation.id)
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleDeleteConversation = async (conversationId: string) => {
    const result = await deleteConversation(conversationId)
    if (result.success) {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId))
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null)
        setMessages([])
      }
      router.refresh()
    }
  }

  const handleSearchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    const result = await searchUsersForChat(query, 10)
    if (result.success) {
      setSearchResults(result.data || [])
    }
  }

  const handleStartNewChat = async (userId: string) => {
    const result = await getOrCreateConversation(userId)
    if (result.success && result.data) {
      setNewChatOpen(false)
      setSearchQuery('')
      setSearchResults([])

      // Check if conversation already exists in list
      const existingConv = conversations.find((c) => c.id === result.data.id)
      if (!existingConv) {
        router.refresh()
        // Reload conversations
        window.location.reload()
      } else {
        handleConversationSelect(existingConv)
      }
    }
  }

  const getOtherUser = (conversation: Conversation, _currentUserId?: string) => {
    // This is a simplified version - you'd need the current user ID
    return conversation.initiator
  }

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = getOtherUser(conv)
    const name = otherUser.profile?.name || otherUser.email
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 h-full'>
      {/* Conversations List */}
      <div className='md:col-span-1 space-y-4'>
        <div className='flex items-center gap-2'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Buscar conversaciones...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>
          <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
            <DialogTrigger asChild>
              <Button size='icon'>
                <MessageSquare className='h-4 w-4' />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo mensaje</DialogTitle>
                <DialogDescription>Busca un usuario para iniciar una conversación</DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <Input placeholder='Buscar por nombre o email...' onChange={(e) => handleSearchUsers(e.target.value)} />
                <ScrollArea className='h-[300px]'>
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className='flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer'
                      onClick={() => handleStartNewChat(user.id)}
                    >
                      <Avatar>
                        <AvatarImage src={user.profile?.imageUrl || ''} />
                        <AvatarFallback>
                          <User className='h-4 w-4' />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='font-medium'>{user.profile?.name || user.email}</p>
                        <p className='text-sm text-muted-foreground'>{user.email}</p>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className='h-[calc(100vh-16rem)]'>
          <div className='space-y-2'>
            {filteredConversations.length === 0 ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-8'>
                  <MessageSquare className='h-12 w-12 text-muted-foreground mb-4' />
                  <p className='text-muted-foreground text-center'>No tienes conversaciones</p>
                </CardContent>
              </Card>
            ) : (
              filteredConversations.map((conversation) => {
                const otherUser = getOtherUser(conversation)
                const unreadCount = conversation.unreadInitiator + conversation.unreadReceiver

                return (
                  <Card
                    key={conversation.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      selectedConversation?.id === conversation.id && 'border-primary bg-primary/5'
                    )}
                    onClick={() => handleConversationSelect(conversation)}
                  >
                    <CardHeader className='p-4'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex items-center gap-3 flex-1'>
                          <Avatar>
                            <AvatarImage src={otherUser.profile?.imageUrl || ''} />
                            <AvatarFallback>
                              <User className='h-4 w-4' />
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2'>
                              <CardTitle className='text-sm truncate'>{otherUser.profile?.name || otherUser.email}</CardTitle>
                              {unreadCount > 0 && (
                                <Badge variant='default' className='text-xs'>
                                  {unreadCount}
                                </Badge>
                              )}
                            </div>
                            <CardDescription className='text-xs truncate'>
                              {conversation.lastMessage || 'Sin mensajes'}
                            </CardDescription>
                            {conversation.lastMessageAt && (
                              <p className='text-xs text-muted-foreground'>
                                {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                                  addSuffix: true,
                                  locale: es
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant='ghost' size='icon' className='h-8 w-8'>
                              <MoreVertical className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteConversation(conversation.id)
                              }}
                              className='text-destructive'
                            >
                              <Trash2 className='h-4 w-4 mr-2' />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                  </Card>
                )
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className='md:col-span-2'>
        {selectedConversation ? (
          <Card className='h-full flex flex-col'>
            <CardHeader className='border-b'>
              <div className='flex items-center gap-3'>
                <Avatar>
                  <AvatarImage src={getOtherUser(selectedConversation).profile?.imageUrl || ''} />
                  <AvatarFallback>
                    <User className='h-4 w-4' />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className='text-lg'>
                    {getOtherUser(selectedConversation).profile?.name || getOtherUser(selectedConversation).email}
                  </CardTitle>
                  <CardDescription className='text-sm'>{getOtherUser(selectedConversation).email}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <ScrollArea className='flex-1 p-4'>
              <div className='space-y-4'>
                {messages.map((message) => {
                  const isOwn = message.senderId === selectedConversation.initiatorId // Simplified
                  return (
                    <div key={message.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                      <div
                        className={cn('max-w-[70%] rounded-lg p-3', isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted')}
                      >
                        <p className='text-sm whitespace-pre-wrap break-words'>{message.content}</p>
                        <p className={cn('text-xs mt-1', isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                            locale: es
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <CardContent className='border-t p-4'>
              <div className='flex items-end gap-2'>
                <Textarea
                  placeholder='Escribe un mensaje...'
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className='min-h-[60px] resize-none'
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isLoading} size='icon'>
                  <Send className='h-4 w-4' />
                </Button>
              </div>
              <p className='text-xs text-muted-foreground mt-2'>Presiona Enter para enviar, Shift + Enter para nueva línea</p>
            </CardContent>
          </Card>
        ) : (
          <Card className='h-full'>
            <CardContent className='flex flex-col items-center justify-center h-full'>
              <MessageSquare className='h-16 w-16 text-muted-foreground mb-4' />
              <p className='text-muted-foreground text-center'>Selecciona una conversación para ver los mensajes</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

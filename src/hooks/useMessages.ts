import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { messagesApi } from '@/lib/api'

export interface Conversation {
  id: string
  otherUser: {
    id: string
    name: string
    avatar_url?: string
    role: string
  }
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
  isRead: boolean
}

export interface SendMessageData {
  conversationId: string
  content: string
}

export function useConversations() {
  const { user, token } = useAuth()

  return useQuery<Conversation[]>({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!token) return []
      const response = await messagesApi.getConversations(token)
      return (response.conversations || []) as Conversation[]
    },
    enabled: !!user && !!token,
    refetchInterval: 5000,
  })
}

export function useMessages(conversationId: string | null) {
  const { user, token } = useAuth()

  return useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId || !token) return []
      const response = await messagesApi.getMessages(conversationId, token)
      return (response.messages || []) as Message[]
    },
    enabled: !!user && !!conversationId && !!token,
    refetchInterval: 3000, 
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  const { user, token } = useAuth()

  return useMutation({
    mutationFn: async (data: SendMessageData) => {
      if (!token) throw new Error('Not authenticated')
      const response = await messagesApi.sendMessage(
        data.conversationId,
        data.content,
        token
      )
      return response.message as Message
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData<Message[]>(
        ['messages', newMessage.conversationId],
        (old) => [...(old || []), newMessage]
      )

      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] })
    },
  })
}

// 4. Mark conversation as read
export function useMarkAsRead() {
  const queryClient = useQueryClient()
  const { user, token } = useAuth()

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!token) throw new Error('Not authenticated')
      await messagesApi.markAsRead(conversationId, token)
    },
    onSuccess: (_, conversationId) => {
      queryClient.setQueryData<Conversation[]>(
        ['conversations', user?.id],
        (old) =>
          old?.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
      )
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] })
    },
  })
}

export function useStartConversation() {
  const queryClient = useQueryClient()
  const { user, token } = useAuth()

  return useMutation({
    mutationFn: async (participantId: string) => {
      if (!token) throw new Error('Not authenticated')
      const response = await messagesApi.startConversation(participantId, token)
      return response.conversation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] })
    },
  })
}

// Add this export to your existing file
export function useDeleteConversation() {
  const queryClient = useQueryClient()
  const { user, token } = useAuth()

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!token) throw new Error('Not authenticated')
      await messagesApi.deleteConversation(conversationId, token)
    },
    onSuccess: () => {
      // Refresh the list to remove the deleted conversation
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] })
    },
  })
}
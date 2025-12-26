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
  lastMessage: string | null
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

export function useConversations() {
  const { user, token } = useAuth()

  return useQuery<Conversation[]>({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!token) return []
      const res = await messagesApi.getConversations(token)
      return res.conversations || []
    },
    enabled: !!user && !!token,
    refetchInterval: 5000,
  })
}

export function useMessages(conversationId: string | null) {
  const { token } = useAuth()

  return useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId || !token) return []
      const res = await messagesApi.getMessages(conversationId, token)
      return res.messages || []
    },
    enabled: !!conversationId && !!token,
    refetchInterval: 3000,
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  const { user, token } = useAuth()

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (!token) throw new Error('Not authenticated')
      const res = await messagesApi.sendMessage(conversationId, content, token)
      return res.message
    },
    onSuccess: (msg) => {
      qc.setQueryData<Message[]>(['messages', msg.conversationId], (old) => [...(old || []), msg])
      qc.invalidateQueries({ queryKey: ['conversations', user?.id] })
    },
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  const { user, token } = useAuth()

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!token) throw new Error('Not authenticated')
      await messagesApi.markAsRead(conversationId, token)
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['conversations', user?.id] })
    },
  })
}

export function useStartConversation() {
  const qc = useQueryClient()
  const { user, token } = useAuth()

  return useMutation({
    mutationFn: async (participantId: string) => {
      if (!token) throw new Error('Not authenticated')
      const res = await messagesApi.startConversation(participantId, token)
      return res.conversation
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations', user?.id] })
    },
  })
}

export function useDeleteConversation() {
  const qc = useQueryClient()
  const { user, token } = useAuth()

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!token) throw new Error('Not authenticated')
      await messagesApi.deleteConversation(conversationId, token)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations', user?.id] })
    },
  })
}

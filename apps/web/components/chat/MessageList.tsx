'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  receiver_id: string
  match_id: string
  profiles: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface MessageListProps {
  otherUserId: string
}

export function MessageList({ otherUserId }: MessageListProps) {
  // supabase is already imported as a singleton
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const loadMessages = async () => {
      try {
        if (!user) throw new Error('Not authenticated')

        // Get existing messages
        const { data, error: messagesError } = await supabase
          .from('messages')
          .select(`
            *,
            profiles!sender_id (
              full_name,
              avatar_url
            )
          `)
          .or(`(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true })

        if (messagesError) throw messagesError
        setMessages((data as unknown as Message[] | null) || [])

        // Subscribe to new messages
        const channel = supabase
          .channel('messages')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `sender_id=eq.${user.id},receiver_id=eq.${otherUserId}`
            },
            (payload) => {
              setMessages(prev => [...prev, payload.new as Message])
            }
          )
          .subscribe()

        return () => {
          channel.unsubscribe()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages')
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [otherUserId, supabase, user])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      if (!user) throw new Error('Not authenticated')

      const { error: sendError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: otherUserId,
          content: newMessage.trim(),
          match_id: 'static-placeholder-match-id'
        })

      if (sendError) throw sendError
      setNewMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-2 ${
              message.sender_id === otherUserId ? 'flex-row' : 'flex-row-reverse'
            }`}
          >
            <Avatar
              src={message.profiles?.avatar_url}
              alt={message.profiles?.full_name || 'User'}
              size="sm"
            />
            <div
              className={`rounded-lg p-3 max-w-[70%] ${
                message.sender_id === otherUserId
                  ? 'bg-gray-100'
                  : 'bg-blue-500 text-white'
              }`}
            >
              <p>{message.content}</p>
              <span className="text-xs opacity-70">
                {new Date(message.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  )
} 
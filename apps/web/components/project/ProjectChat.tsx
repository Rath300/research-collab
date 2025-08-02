'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/trpc';
import { FiSend, FiMessageSquare, FiLoader, FiUser } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';

interface ProjectChatProps {
  projectId: string;
}

interface MessageWithSender {
  id: string;
  content: string;
  created_at: Date;
  user_id: string;
  sender: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function ProjectChat({ projectId }: ProjectChatProps) {
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const { data: messagesData, isLoading, refetch } = api.chat.listMessagesForProject.useQuery(
    { projectId, limit: 50 },
    { enabled: isExpanded }
  );

  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage('');
      refetch();
      scrollToBottom();
    },
  });

  const messages = messagesData?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isExpanded && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isExpanded]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      projectId,
      content: message.trim(),
    });
  };

  const getDisplayName = (sender: MessageWithSender['sender']) => {
    if (!sender) return 'Anonymous';
    const firstName = sender.first_name || '';
    const lastName = sender.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Anonymous';
  };

  if (!isExpanded) {
    return (
      <Card className="bg-white border-border-light">
        <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(true)}>
          <CardTitle className="text-xl font-bold flex items-center justify-between">
            <div className="flex items-center">
              <FiMessageSquare className="mr-2" />
              Project Chat
            </div>
            <Button variant="outline" size="sm">
              Open Chat
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-border-light">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center">
            <FiMessageSquare className="mr-2" />
            Project Chat
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsExpanded(false)}>
            Minimize
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-96">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-3 bg-neutral-800/50 rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <FiLoader className="animate-spin text-2xl mr-2" />
                <span>Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                <FiMessageSquare className="text-4xl mb-2" />
                <p>No messages yet</p>
                <p className="text-sm">Be the first to say something!</p>
              </div>
            ) : (
              messages.map((msg: MessageWithSender) => {
                const isCurrentUser = msg.user_id === user?.id;
                const displayName = getDisplayName(msg.sender);
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isCurrentUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-neutral-700 text-neutral-100'
                      }`}
                    >
                      {!isCurrentUser && (
                        <div className="flex items-center mb-1">
                          <Avatar
                            src={msg.sender?.avatar_url}
                            alt={displayName}
                            size="sm"
                            fallback={<FiUser className="w-3 h-3" />}
                            className="mr-2"
                          />
                          <span className="text-xs font-medium text-neutral-300">
                            {displayName}
                          </span>
                        </div>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-blue-200' : 'text-neutral-400'
                        }`}
                      >
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="flex items-center gap-2"
            >
              {sendMessageMutation.isPending ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiSend className="w-4 h-4" />
              )}
              Send
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

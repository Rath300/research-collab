import { getSupabaseClient } from './supabaseClient';
import { type Database } from '../types/database.types';

type Message = Database['public']['Tables']['messages']['Row'];
type InsertMessage = Database['public']['Tables']['messages']['Insert'];

export async function getMessages(matchId: string, limit = 50): Promise<Message[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:sender_id(first_name, last_name, avatar_url), receiver:receiver_id(first_name, last_name, avatar_url)')
    .eq('match_id', matchId)
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
  
  return data as Message[];
}

export async function sendMessage(message: InsertMessage): Promise<Message> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();
    
  if (error) {
    console.error('Error sending message:', error);
    throw error;
  }
  
  return data as Message;
}

export async function markMessagesAsRead(matchId: string, userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('match_id', matchId)
    .eq('receiver_id', userId)
    .eq('is_read', false);
    
  if (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}

export async function setupMessageListener(
  matchId: string, 
  callback: (message: Message) => void
): Promise<() => void> {
  const supabase = getSupabaseClient();
  
  const subscription = supabase
    .channel(`match-${matchId}-messages`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`
      },
      (payload: { new: Message }) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();
    
  // Return a cleanup function
  return () => {
    supabase.removeChannel(subscription);
  };
} 
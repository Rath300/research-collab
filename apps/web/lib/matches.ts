import { getSupabaseClient } from './supabaseClient';
import { type Database } from '../types/database.types';

type Match = Database['public']['Tables']['matches']['Row'];
type InsertMatch = Database['public']['Tables']['matches']['Insert'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export async function getPotentialMatches(userId: string, limit = 10): Promise<Profile[]> {
  const supabase = getSupabaseClient();
  
  // Get existing matches (either way) to exclude
  const { data: existingMatches, error: matchError } = await supabase
    .from('matches')
    .select('user_id_1, user_id_2')
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);
    
  if (matchError) {
    console.error('Error fetching existing matches:', matchError);
    throw matchError;
  }
  
  // Extract user IDs to exclude
  const excludeIds = new Set<string>([userId]);
  existingMatches?.forEach((match: { user_id_1: string; user_id_2: string }) => {
    excludeIds.add(match.user_id_1);
    excludeIds.add(match.user_id_2);
  });
  
  // Get potential matches
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .not('id', 'in', `(${Array.from(excludeIds).join(',')})`)
    .limit(limit);
    
  if (profileError) {
    console.error('Error fetching potential matches:', profileError);
    throw profileError;
  }
  
  return profiles as Profile[];
}

export async function createMatch(
  userId: string, 
  otherUserId: string, 
  status: 'pending' | 'matched' | 'rejected' = 'pending'
): Promise<Match> {
  const supabase = getSupabaseClient();
  
  // Check if a match already exists (other user already swiped right)
  const { data: existingMatch, error: fetchError } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id_1', otherUserId)
    .eq('user_id_2', userId)
    .eq('status', 'pending')
    .maybeSingle();
    
  if (fetchError) {
    console.error('Error checking for existing match:', fetchError);
    throw fetchError;
  }
  
  if (existingMatch) {
    // Update the existing match to "matched" status
    if (status === 'pending' || status === 'matched') {
      const { data, error } = await supabase
        .from('matches')
        .update({ status: 'matched', updated_at: new Date().toISOString() })
        .eq('id', existingMatch.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating match:', error);
        throw error;
      }
      
      return data as Match;
    } else {
      // Handle rejection of an existing pending match
      const { data, error } = await supabase
        .from('matches')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', existingMatch.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error rejecting match:', error);
        throw error;
      }
      
      return data as Match;
    }
  } else {
    // Create a new pending match
    const matchData: InsertMatch = {
      user_id_1: userId,
      user_id_2: otherUserId,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('matches')
      .insert(matchData)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating match:', error);
      throw error;
    }
    
    return data as Match;
  }
}

export async function getMatches(userId: string): Promise<Match[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      user1:user_id_1(id, first_name, last_name, avatar_url, title, institution),
      user2:user_id_2(id, first_name, last_name, avatar_url, title, institution)
    `)
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
    .eq('status', 'matched');
    
  if (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
  
  return data as Match[];
} 
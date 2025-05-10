import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@research-collab/db';
import type { User, Session, AuthResponse } from '@supabase/supabase-js';

// Query key factory
const authKeys = {
  session: () => ['auth', 'session'] as const,
  user: () => ['auth', 'user'] as const,
};

/**
 * Hook to get the current session
 */
export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
  });
}

/**
 * Hook to get the current user
 */
export function useUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },
  });
}

/**
 * Hook to sign in with email and password
 */
export function useSignInWithPassword() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      email, 
      password 
    }: { 
      email: string; 
      password: string 
    }): Promise<AuthResponse> => {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (response.error) throw response.error;
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.session(), data.data.session);
      queryClient.setQueryData(authKeys.user(), data.data.user);
    },
  });
}

/**
 * Hook to sign up with email and password
 */
export function useSignUpWithPassword() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      email, 
      password, 
      metadata 
    }: { 
      email: string; 
      password: string;
      metadata?: { first_name?: string; last_name?: string; [key: string]: any };
    }): Promise<AuthResponse> => {
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (response.error) throw response.error;
      return response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.session(), data.data.session);
      queryClient.setQueryData(authKeys.user(), data.data.user);
    },
  });
}

/**
 * Hook to sign in with a third-party provider
 */
export function useSignInWithOAuth() {
  return useMutation({
    mutationFn: async ({ 
      provider, 
      redirectTo 
    }: { 
      provider: 'google' | 'github' | 'twitter'; 
      redirectTo?: string 
    }) => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });
      
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to sign out
 */
export function useSignOut() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session(), null);
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.invalidateQueries();
    },
  });
}

/**
 * Hook to reset password
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to update password
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      return data;
    },
  });
} 
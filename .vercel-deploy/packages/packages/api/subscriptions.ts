import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Subscription, subscriptionSchema } from '@research-collab/db';

// Query key factory
const subscriptionKeys = {
  all: () => ['subscriptions'] as const,
  lists: () => [...subscriptionKeys.all(), 'list'] as const,
  list: (filters: Record<string, any>) => [...subscriptionKeys.lists(), filters] as const,
  userSubscription: (userId: string) => [...subscriptionKeys.all(), 'user', userId] as const,
};

/**
 * Hook to get a user's subscription
 */
export function useUserSubscription(userId: string) {
  return useQuery({
    queryKey: subscriptionKeys.userSubscription(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        // If no subscription found, return null instead of throwing
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      return data as Subscription;
    },
    enabled: !!userId,
  });
}

/**
 * Hook to check if a user has premium subscription
 */
export function useHasPremium(userId: string) {
  return useQuery({
    queryKey: [...subscriptionKeys.userSubscription(userId), 'premium'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .eq('plan_type', 'premium')
        .maybeSingle();
      
      if (error) throw error;
      
      // If we have an active premium subscription, return true
      return !!data;
    },
    enabled: !!userId,
  });
}

/**
 * Hook to create a checkout session for a subscription
 * Note: This would typically call a secure server endpoint
 */
export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: async ({ 
      userId, 
      priceId, 
      returnUrl 
    }: { 
      userId: string; 
      priceId: string;
      returnUrl: string;
    }) => {
      // In a real implementation, this would call a serverless function
      // that creates a Stripe checkout session
      
      // Example structure of what would happen on the server:
      // 1. Create a Stripe checkout session
      // 2. Return the session ID and URL
      
      // For this example, we'll return mock data:
      return {
        sessionId: 'mock_session_id',
        url: `https://example.com/checkout?session=${priceId}&user=${userId}&return=${encodeURIComponent(returnUrl)}`,
      };
    },
  });
}

/**
 * Hook to create/update a subscription in the database
 * This would be called by a webhook handler when Stripe events occur
 */
export function useUpsertSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (subscription: Omit<Subscription, 'id' | 'created_at'>) => {
      // First check if a subscription exists for this user
      const { data: existingSubscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', subscription.user_id)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      let result;
      
      if (existingSubscription) {
        // Update existing subscription
        const { data, error } = await supabase
          .from('subscriptions')
          .update(subscription)
          .eq('id', existingSubscription.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new subscription
        const { data, error } = await supabase
          .from('subscriptions')
          .insert(subscription)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }
      
      return result as Subscription;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.userSubscription(data.user_id) });
    },
  });
}

/**
 * Hook to redirect to the Stripe customer portal
 */
export function useCustomerPortal() {
  return useMutation({
    mutationFn: async ({ 
      customerId, 
      returnUrl 
    }: { 
      customerId: string; 
      returnUrl: string;
    }) => {
      // In a real implementation, this would call a serverless function
      // that creates a Stripe customer portal session
      
      // For this example, we'll return mock data:
      return {
        url: `https://example.com/customer-portal?customer=${customerId}&return=${encodeURIComponent(returnUrl)}`,
      };
    },
  });
}

/**
 * Hook to calculate remaining time in subscription
 */
export function useSubscriptionTimeRemaining(subscription: Subscription | null) {
  return useQuery({
    queryKey: ['subscription', 'timeRemaining', subscription?.id],
    queryFn: () => {
      if (!subscription || !subscription.current_period_end) {
        return { days: 0, isExpiringSoon: false };
      }
      
      const now = new Date();
      const endDate = new Date(subscription.current_period_end);
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return { 
        days: diffDays,
        isExpiringSoon: diffDays <= 7 && diffDays > 0
      };
    },
    enabled: !!subscription,
  });
} 
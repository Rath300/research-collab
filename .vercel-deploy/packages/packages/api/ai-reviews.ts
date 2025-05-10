import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, AIReview, aiReviewSchema } from '@research-collab/db';

// Query key factory
const aiReviewKeys = {
  all: () => ['ai_reviews'] as const,
  lists: () => [...aiReviewKeys.all(), 'list'] as const,
  list: (filters: Record<string, any>) => [...aiReviewKeys.lists(), filters] as const,
  details: () => [...aiReviewKeys.all(), 'detail'] as const,
  detail: (id: string) => [...aiReviewKeys.details(), id] as const,
  user: (userId: string) => [...aiReviewKeys.lists(), { userId }] as const,
};

/**
 * Hook to get an AI review by ID
 */
export function useAIReview(id: string) {
  return useQuery({
    queryKey: aiReviewKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_reviews')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as AIReview;
    },
    enabled: !!id,
  });
}

/**
 * Hook to get all AI reviews for a user
 */
export function useUserAIReviews(userId: string) {
  return useQuery({
    queryKey: aiReviewKeys.user(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AIReview[];
    },
    enabled: !!userId,
  });
}

/**
 * Hook to create an AI review
 * Note: This would use a serverless function to call the AI API
 */
export function useCreateAIReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      text 
    }: { 
      userId: string; 
      text: string;
    }) => {
      // In a real implementation, this would call a serverless function
      // that interacts with an AI API like OpenAI or Claude
      
      // Placeholder for the AI review response
      // In a real app, this would be the response from the AI API
      const mockAiResponse = {
        review_content: `This is a mock AI review of your text. In a real implementation, 
          this would be the response from analyzing your text with Claude or another AI model.`,
        suggested_edits: `Here are some suggested edits to improve your text.
          - Consider restructuring the introduction
          - Add more details to section 2
          - Review the conclusion for clarity`,
        suggested_citations: [
          "Smith, J. (2023). Related Research on This Topic",
          "Johnson, M. et al. (2022). Important Framework"
        ],
        quality_score: 75
      };
      
      // Create the AI review record
      const aiReview: Omit<AIReview, 'id' | 'created_at'> = {
        user_id: userId,
        original_text: text,
        review_content: mockAiResponse.review_content,
        suggested_edits: mockAiResponse.suggested_edits,
        suggested_citations: mockAiResponse.suggested_citations,
        quality_score: mockAiResponse.quality_score,
      };
      
      // Validate with Zod
      const validated = aiReviewSchema
        .omit({ id: true, created_at: true })
        .parse(aiReview);
      
      // Save to database
      const { data, error } = await supabase
        .from('ai_reviews')
        .insert(validated)
        .select()
        .single();
      
      if (error) throw error;
      return data as AIReview;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: aiReviewKeys.user(data.user_id) });
    },
  });
}

/**
 * Function to analyze text using AI (this would be called from an Edge Function)
 * This is a mock implementation - in reality, this would be a server-side function
 */
export async function analyzeTextWithAI(text: string): Promise<{
  review_content: string;
  suggested_edits: string;
  suggested_citations: string[];
  quality_score: number;
}> {
  // In a real implementation, this would call the AI API
  // Example with OpenAI (would be implemented in an Edge Function):
  /*
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { 
        role: "system", 
        content: "You are a research paper reviewer. Analyze the paper, provide feedback, suggest edits, suggest citations, and give a quality score from 0-100." 
      },
      { 
        role: "user", 
        content: text 
      }
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });
  */
  
  // Return mock response
  return {
    review_content: `This is a mock AI review. In a real implementation, 
      this would be the response from analyzing your text with Claude or another AI model.`,
    suggested_edits: `Here are some suggested edits to improve your text.
      - Consider restructuring the introduction
      - Add more details to section 2
      - Review the conclusion for clarity`,
    suggested_citations: [
      "Smith, J. (2023). Related Research on This Topic",
      "Johnson, M. et al. (2022). Important Framework"
    ],
    quality_score: 75
  };
} 
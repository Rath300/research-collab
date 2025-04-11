import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Proof, proofSchema } from '@research-collab/db';
import SHA256 from 'crypto-js/sha256';
import Hex from 'crypto-js/enc-hex';

// Query key factory
const proofKeys = {
  all: () => ['proofs'] as const,
  lists: () => [...proofKeys.all(), 'list'] as const,
  list: (filters: Record<string, any>) => [...proofKeys.lists(), filters] as const,
  details: () => [...proofKeys.all(), 'detail'] as const,
  detail: (id: string) => [...proofKeys.details(), id] as const,
};

/**
 * Hook to get proofs for a specific project
 */
export function useProjectProofs(projectId: string) {
  return useQuery({
    queryKey: proofKeys.list({ projectId }),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proofs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Proof[];
    },
    enabled: !!projectId,
  });
}

/**
 * Hook to get a specific proof by ID
 */
export function useProof(id: string) {
  return useQuery({
    queryKey: proofKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proofs')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name
          ),
          projects:project_id (
            id,
            title
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Proof & { 
        profiles: { id: string; first_name: string; last_name: string };
        projects: { id: string; title: string };
      };
    },
    enabled: !!id,
  });
}

/**
 * Utility function to generate a content hash
 */
export function generateContentHash(content: string): string {
  return SHA256(content).toString(Hex);
}

/**
 * Hook to create a new proof of ownership
 */
export function useCreateProof() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      projectId,
      content,
    }: {
      userId: string;
      projectId: string;
      content: string;
    }) => {
      // Generate hash from content
      const contentHash = generateContentHash(content);
      
      const proof: Omit<Proof, 'id' | 'created_at'> = {
        user_id: userId,
        project_id: projectId,
        content_hash: contentHash,
        timestamp: new Date().toISOString(),
        blockchain_tx: null,
      };
      
      // Validate with Zod
      const validated = proofSchema
        .omit({ id: true, created_at: true })
        .parse(proof);
      
      const { data, error } = await supabase
        .from('proofs')
        .insert(validated)
        .select()
        .single();
      
      if (error) throw error;
      return data as Proof;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: proofKeys.list({ projectId: data.project_id }) });
    },
  });
}

/**
 * Hook to update a proof with blockchain transaction info
 */
export function useUpdateProofBlockchain() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      proofId,
      blockchainTx,
    }: {
      proofId: string;
      blockchainTx: string;
    }) => {
      const { data, error } = await supabase
        .from('proofs')
        .update({ blockchain_tx: blockchainTx })
        .eq('id', proofId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Proof;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: proofKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: proofKeys.list({ projectId: data.project_id }) });
    },
  });
}

/**
 * Hook to verify if a content matches a stored hash
 * Returns true if content matches stored hash
 */
export function useVerifyProof(proofId: string, content?: string) {
  return useQuery({
    queryKey: [...proofKeys.detail(proofId), 'verify', content],
    queryFn: async () => {
      if (!content) return { isValid: false, proof: null };
      
      // Get the stored proof
      const { data, error } = await supabase
        .from('proofs')
        .select('*')
        .eq('id', proofId)
        .single();
      
      if (error) throw error;
      
      // Generate hash from provided content
      const contentHash = generateContentHash(content);
      
      // Compare hashes
      const isValid = contentHash === data.content_hash;
      
      return { isValid, proof: data as Proof };
    },
    enabled: !!proofId && !!content,
  });
} 
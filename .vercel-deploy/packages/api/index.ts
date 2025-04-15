// Main API exports
import { supabase } from '@research-collab/db';

// Export the individual API modules
export * from './auth';
export * from './profiles';
export * from './research-posts';
export * from './collaborator-matches';
export * from './guilds';
export * from './projects';
export * from './mentors';
export * from './messages';
export * from './proofs';
export * from './ai-reviews';
export * from './subscriptions';

// Export the Supabase client for direct access when needed
export { supabase }; 
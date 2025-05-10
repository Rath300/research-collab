// Main API exports
import { supabase } from '@research-collab/db';
import type { AppRouter } from './src/router';

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

export { createContext } from './src/context';
export { appRouter } from './src/router';

export type { AppRouter }; 
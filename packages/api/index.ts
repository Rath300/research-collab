// Main API exports
import { supabase } from '@research-collab/db';
import type { AppRouter } from './src/router';

// Export the individual API modules that actually exist
export * from './auth';
export * from './profiles';
export * from './proofs';
export * from './ai-reviews';
export * from './subscriptions';

// Export the Supabase client for direct access when needed
export { supabase }; 

export { createContext } from './src/context';
export { appRouter } from './src/router';

export type { AppRouter }; 
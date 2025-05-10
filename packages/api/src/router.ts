import { router } from './trpc';
import { slackRouter } from './slack/router';

export const appRouter = router({
  slack: slackRouter,
  // Add other routers here
});

export type AppRouter = typeof appRouter; 
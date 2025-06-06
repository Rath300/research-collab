import { router } from './trpc';
import { slackRouter } from './slack/router';
import { workspaceRouter } from './routers/workspace';
import { projectRouter } from './routers/project';
import { taskRouter } from './routers/task';
import { chatRouter } from './routers/chat';
import { profileRouter } from './routers/profile';
import { collaborationRouter } from './routers/collaboration';
import { externalApiRouter } from './routers/externalApi';

export const appRouter = router({
  slack: slackRouter,
  workspace: workspaceRouter,
  project: projectRouter,
  task: taskRouter,
  chat: chatRouter,
  profile: profileRouter,
  collaboration: collaborationRouter,
  external: externalApiRouter,
  // Add other routers here
});

export type AppRouter = typeof appRouter; 
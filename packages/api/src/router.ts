import { router } from './trpc';
import { slackRouter } from './slack/router';
import { workspaceRouter } from './routers/workspace';
import { projectRouter } from './routers/project';
import { taskRouter } from './routers/task';
import { chatRouter } from './routers/chat';

export const appRouter = router({
  slack: slackRouter,
  workspace: workspaceRouter,
  project: projectRouter,
  task: taskRouter,
  chat: chatRouter,
  // Add other routers here
});

export type AppRouter = typeof appRouter; 
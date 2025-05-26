import { router } from '../trpc';
import { teamRouter } from './team';
import { projectRouter } from './project';

export const appRouter = router({
  team: teamRouter,
  project: projectRouter,
});

export type AppRouter = typeof appRouter;

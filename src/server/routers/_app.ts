import { router } from '../trpc';
import { teamRouter } from './team';
import { projectRouter } from './project';
import { plannerRouter } from './planner';

export const appRouter = router({
  team: teamRouter,
  project: projectRouter,
  planner: plannerRouter,
});

export type AppRouter = typeof appRouter;

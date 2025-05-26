import { router } from '../trpc';
import { teamRouter } from './team';
import { projectRouter } from './project';
import { plannerRouter } from './planner';
import { assignmentRouter } from './assignment';

export const appRouter = router({
  team: teamRouter,
  project: projectRouter,
  planner: plannerRouter,
  assignment: assignmentRouter,
});

export type AppRouter = typeof appRouter;

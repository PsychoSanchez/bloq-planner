import { router } from '../trpc';
import { teamRouter } from './team';

export const appRouter = router({
  team: teamRouter,
});

export type AppRouter = typeof appRouter;

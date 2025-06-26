import * as Sentry from '@sentry/node';
import { initTRPC } from '@trpc/server';
import { type Context } from './context';

const t = initTRPC.context<Context>().create({
  sse: {
    ping: {
      enabled: true,
      intervalMs: 2_000,
    },
    client: {
      reconnectAfterInactivityMs: 3_000,
    },
  },
});

const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  }),
);

export const router = t.router;
export const publicProcedure = t.procedure.use(sentryMiddleware);

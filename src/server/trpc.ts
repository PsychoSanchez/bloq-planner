import { initTRPC } from '@trpc/server';
import { EventEmitter } from 'events';
import { type Context } from './context';

// Event emitter for real-time updates
export const assignmentEventEmitter = new EventEmitter();

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

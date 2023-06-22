import { TRPCError, initTRPC } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;
const middleware = t.middleware;

const isAuthed = middleware(({ next, ctx }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

/**
 * Protected base procedure
 */
export const authedProcedure = t.procedure.use(isAuthed);

import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth].api';

/**
 * Inject next-auth session into context
 */
export const createContext = async (
  opts: trpcNext.CreateNextContextOptions,
) => {
  const session = await getServerSession(opts.req, opts.res, authOptions);

  return {
    session,
    req: opts.req,
    res: opts.res,
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;

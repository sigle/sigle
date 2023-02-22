import { mergeRouters } from '../trpc';
import { postRouter } from './post';

export const appRouter = mergeRouters(postRouter);

export type AppRouter = typeof appRouter;

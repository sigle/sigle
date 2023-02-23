import { mergeRouters } from '../trpc';
import { postRouter } from './post';
import { userRouter } from './user';

export const appRouter = mergeRouters(postRouter, userRouter);

export type AppRouter = typeof appRouter;

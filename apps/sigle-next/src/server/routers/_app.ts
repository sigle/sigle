import { router } from '../trpc';
import { postRouter } from './post';
import { userRouter } from './user';
import { subscriptionRouter } from './subscription';

export const appRouter = router({
  user: userRouter,
  post: postRouter,
  subscription: subscriptionRouter,
});

export type AppRouter = typeof appRouter;

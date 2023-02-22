import { prismaClient } from '@/lib/prisma';
import { router, procedure } from '../trpc';

export const postRouter = router({
  postList: procedure.query(async () => {
    const posts = await prismaClient.post.findMany({
      select: {
        created_at: true,
        stream_content: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return posts;
  }),
});

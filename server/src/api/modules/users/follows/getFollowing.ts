import { FastifyInstance } from 'fastify';
import { prisma } from '../../../../prisma';

type GetUserFollowingResponse = string[];
const getUserFollowingResponseSchema = {
  type: 'array',
  items: {
    type: 'string',
  },
};

export async function createGetUserFollowingEndpoint(fastify: FastifyInstance) {
  return fastify.get<{
    Reply: GetUserFollowingResponse;
    Params: { userAddress: string };
  }>(
    '/api/users/:userAddress/following',
    {
      schema: {
        description: 'Returns a list of users the specified user is following.',
        tags: ['user'],
        params: {
          type: 'object',
          required: ['userAddress'],
          properties: {
            userAddress: { type: 'string' },
          },
        },
        response: {
          200: getUserFollowingResponseSchema,
        },
      },
    },
    async (req, res) => {
      const { userAddress } = req.params;

      const followers = await prisma.follows.findMany({
        where: {
          followerAddress: userAddress,
        },
        select: {
          followingAddress: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.send(followers.map((follower) => follower.followingAddress));
    }
  );
}

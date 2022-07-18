import { FastifyInstance } from 'fastify';
import { prisma } from '../../../../prisma';

type GetUserFollowersResponse = string[];
const getUserFollowersResponseSchema = {
  type: 'array',
  items: {
    type: 'string',
  },
};

export async function createGetUserFollowersEndpoint(fastify: FastifyInstance) {
  return fastify.get<{
    Reply: GetUserFollowersResponse;
    Params: { userAddress: string };
  }>(
    '/api/users/:userAddress/followers',
    {
      schema: {
        description:
          'Returns a list of users who are followers of the specified user.',
        tags: ['user'],
        response: {
          200: getUserFollowersResponseSchema,
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

import { FastifyInstance } from 'fastify';
import { prisma } from '../../../prisma';

type GetUserExploreResponse = {
  id: string;
  stacksAddress: string;
}[];
const getUserExploreResponseSchema = {
  type: 'array',
  items: {
    type: 'object',
    required: ['id', 'stacksAddress'],
    properties: {
      id: { type: 'string' },
      stacksAddress: { type: 'string' },
    },
  },
};

export async function createGetUserExploreEndpoint(fastify: FastifyInstance) {
  return fastify.get<{
    Reply: GetUserExploreResponse;
  }>(
    '/api/users/explore',
    {
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Return a list of users using Sigle.',
        tags: ['user'],
        response: {
          200: getUserExploreResponseSchema,
        },
      },
    },
    async (req, res) => {
      // TODO
      const users = await prisma.user.findMany({
        // Remove the current logged in user from the list
        where: { stacksAddress: { not: req.address } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return res.send(users);
    }
  );
}

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
        response: {
          200: getUserExploreResponseSchema,
        },
      },
    },
    async (req, res) => {
      const users = await prisma.user.findMany({
        // Remove the current logged in user from the list
        where: { stacksAddress: { not: req.address } },
        orderBy: { createdAt: 'desc' },
      });
      return res.send(users);
    }
  );
}

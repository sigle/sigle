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
    Params: { page?: number };
  }>(
    '/api/users/explore',
    {
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Return a list of users using Sigle.',
        tags: ['user'],
        params: {
          page: { type: 'number' },
        },
        response: {
          200: getUserExploreResponseSchema,
        },
      },
    },
    async (req, res) => {
      let { page } = req.params;
      if (!page || page === 0) {
        page = 1;
      }
      // TODO set to 50 before merging
      const pageSize = 20;

      const users = await prisma.user.findMany({
        // Remove the current logged in user from the list
        where: { stacksAddress: { not: req.address } },
        orderBy: { followers: { _count: 'desc' } },
        skip: pageSize * page,
        take: pageSize,
      });
      return res.send(users);
    }
  );
}

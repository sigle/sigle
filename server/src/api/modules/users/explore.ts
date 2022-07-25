import { FastifyInstance } from 'fastify';
import { prisma } from '../../../prisma';

type GetUserExploreResponse = {
  nextPage: number | null;
  data: { id: string; stacksAddress: string }[];
};
const getUserExploreResponseSchema = {
  type: 'object',
  required: ['data'],
  properties: {
    nextPage: { type: 'number', nullable: true },
    data: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'stacksAddress'],
        properties: {
          id: { type: 'string' },
          stacksAddress: { type: 'string' },
        },
      },
    },
  },
};

export async function createGetUserExploreEndpoint(fastify: FastifyInstance) {
  return fastify.get<{
    Reply: GetUserExploreResponse;
    Querystring: { page?: number };
  }>(
    '/api/users/explore',
    {
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Return a list of users using Sigle.',
        tags: ['user'],
        querystring: {
          page: { type: 'number' },
        },
        response: {
          200: getUserExploreResponseSchema,
        },
      },
    },
    async (req, res) => {
      let { page } = req.query;
      if (!page || page === 0) {
        page = 1;
      }
      const pageSize = 50;
      const where = { stacksAddress: { not: req.address } };

      const users = await prisma.user.findMany({
        // Remove the current logged in user from the list
        where,
        orderBy: { followers: { _count: 'desc' } },
        skip: pageSize * (page - 1),
        take: pageSize,
        include: {
          _count: true,
        },
      });
      const usersCount = await prisma.user.count({ where });
      const nextPage = usersCount > pageSize * page ? page + 1 : null;

      return res.send({ data: users, nextPage });
    }
  );
}

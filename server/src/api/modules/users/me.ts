import { FastifyInstance } from 'fastify';
import { prisma } from '../../../prisma';

type GetUserMeResponse = {
  id: string;
  stacksAddress: string;
};
const getUserMeResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    stacksAddress: { type: 'string' },
  },
};

export async function createGetUserMeEndpoint(fastify: FastifyInstance) {
  return fastify.get<{
    Reply: GetUserMeResponse;
  }>(
    '/api/users/me',
    {
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Return the current logged in user.',
        tags: ['user'],
        response: {
          200: getUserMeResponseSchema,
        },
      },
    },
    async (req, res) => {
      let loggedInUser = await prisma.user.findUnique({
        where: { stacksAddress: req.address },
        select: {
          id: true,
          stacksAddress: true,
        },
      });

      if (!loggedInUser) {
        loggedInUser = await prisma.user.create({
          data: {
            stacksAddress: req.address,
          },
        });
      }

      return res.send(loggedInUser);
    }
  );
}

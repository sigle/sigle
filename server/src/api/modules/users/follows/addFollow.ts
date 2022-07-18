import { FastifyInstance } from 'fastify';
import { prisma } from '../../../../prisma';

interface AddFollowBody {
  stacksAddress: string;
  createdAt: number;
}

type AddFollowResponse = true;
const AddFollowResponseSchema = {
  type: 'boolean',
};

export async function createAddFollowEndpoint(fastify: FastifyInstance) {
  return fastify.post<{
    body: AddFollowBody;
    Reply: AddFollowResponse;
  }>(
    '/api/users/me/following',
    {
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Allows a user to follow another user.',
        tags: ['user'],
        body: {
          type: 'object',
          required: ['stacksAddress', 'createdAt'],
          properties: {
            stacksAddress: { type: 'string' },
            createdAt: { type: 'number' },
          },
        },
        response: {
          200: AddFollowResponseSchema,
        },
      },
    },
    async (req, res) => {
      const body = req.body as AddFollowBody;
      // TODO validate stacksAddress format
      // TODO validate createdAt format

      const createdAt = new Date(body.createdAt);

      await prisma.follows.createMany({
        data: [
          {
            followerAddress: req.address,
            followingAddress: body.stacksAddress,
            createdAt,
          },
          {
            followerAddress: body.stacksAddress,
            followingAddress: req.address,
            createdAt,
          },
        ],
      });

      res.send(true);
    }
  );
}

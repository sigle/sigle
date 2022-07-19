import { FastifyInstance } from 'fastify';
import { validateStacksAddress } from '@stacks/transactions';
import { prisma } from '../../../../prisma';

interface AddFollowBody {
  stacksAddress: string;
  createdAt: number;
}

interface AddFollowResponseError {
  error: string;
  message: string;
}

type AddFollowResponse = true;
const addFollowResponseSchema = {
  type: 'boolean',
};

export async function createAddFollowEndpoint(fastify: FastifyInstance) {
  return fastify.post<{
    body: AddFollowBody;
    Reply: AddFollowResponseError | AddFollowResponse;
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
          200: addFollowResponseSchema,
        },
      },
    },
    async (req, res) => {
      const body = req.body as AddFollowBody;

      if (!validateStacksAddress(body.stacksAddress)) {
        return res.code(400).send({
          error: 'Bad Request',
          message: 'stacksAddress is not a valid Stacks address.',
        });
      }

      if (body.stacksAddress === req.address) {
        return res.code(400).send({
          error: 'Bad Request',
          message: 'You cannot follow yourself.',
        });
      }

      await prisma.follows.create({
        data: {
          followerAddress: req.address,
          followingAddress: body.stacksAddress,
          createdAt: new Date(body.createdAt),
        },
      });

      res.send(true);
    }
  );
}

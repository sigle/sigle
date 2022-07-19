import { FastifyInstance } from 'fastify';
import { validateStacksAddress } from '@stacks/transactions';
import { prisma } from '../../../../prisma';

interface DeleteFollowBody {
  stacksAddress: string;
}

interface DeleteFollowResponseError {
  error: string;
  message: string;
}

type DeleteFollowResponse = true;
const deleteFollowResponseSchema = {
  type: 'boolean',
};

export async function createDeleteFollowEndpoint(fastify: FastifyInstance) {
  return fastify.delete<{
    body: DeleteFollowBody;
    Reply: DeleteFollowResponseError | DeleteFollowResponse;
  }>(
    '/api/users/me/following',
    {
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Allows a user to unfollow another user.',
        tags: ['user'],
        body: {
          type: 'object',
          required: ['stacksAddress'],
          properties: {
            stacksAddress: { type: 'string' },
          },
        },
        response: {
          200: deleteFollowResponseSchema,
        },
      },
    },
    async (req, res) => {
      const body = req.body as DeleteFollowBody;

      if (!validateStacksAddress(body.stacksAddress)) {
        return res.code(400).send({
          error: 'Bad Request',
          message: 'stacksAddress is not a valid Stacks address.',
        });
      }

      if (body.stacksAddress === req.address) {
        return res.code(400).send({
          error: 'Bad Request',
          message: 'You cannot unfollow yourself.',
        });
      }

      await prisma.follows.deleteMany({
        where: {
          OR: [
            {
              followerAddress: req.address,
              followingAddress: body.stacksAddress,
            },
            {
              followerAddress: body.stacksAddress,
              followingAddress: req.address,
            },
          ],
        },
      });

      res.send(true);
    }
  );
}

import { FastifyInstance } from 'fastify';
import { prisma } from '../../../prisma';

type GetSubscriptionResponse = {
  id: string;
  nftId: number;
} | null;
const analyticsReferrersResponseSchema = {
  description:
    'Returns the current active subscription object. If no active subscription is found, null is returned.',
  type: 'object',
  nullable: true,
  required: ['id', 'nftId'],
  properties: {
    id: { type: 'string' },
    nftId: { type: 'number' },
  },
  example: { id: 'XXX', nftId: 420 },
};

export async function createGetSubscriptionEndpoint(fastify: FastifyInstance) {
  return fastify.get<{
    Reply: GetSubscriptionResponse;
  }>(
    '/api/subscriptions',
    {
      onRequest: [fastify.authenticate],
      schema: {
        description:
          'Return the current active subscription of the current logged in user.',
        tags: ['subscription'],
        response: {
          200: analyticsReferrersResponseSchema,
        },
        security: [
          {
            session: [],
          },
        ],
      },
    },
    async (req, res) => {
      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          user: { stacksAddress: req.address },
          status: 'ACTIVE',
        },
        select: {
          id: true,
          nftId: true,
        },
      });
      res.send(activeSubscription);
    }
  );
}

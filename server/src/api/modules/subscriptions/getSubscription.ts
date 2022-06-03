import { FastifyInstance } from 'fastify';
import { prisma } from '../../../prisma';

type GetSubscriptionResponse = {
  id: string;
  nftId: number;
} | null;
const analyticsReferrersResponseSchema = {
  type: 'object',
  nullable: true,
  properties: {
    id: { type: 'string' },
    nftId: { type: 'number' },
  },
};

export async function createGetSubscriptionEndpoint(fastify: FastifyInstance) {
  return fastify.get<{
    Reply: GetSubscriptionResponse;
  }>(
    '/api/subscriptions',
    {
      onRequest: [fastify.authenticate],
      schema: {
        response: {
          200: analyticsReferrersResponseSchema,
        },
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

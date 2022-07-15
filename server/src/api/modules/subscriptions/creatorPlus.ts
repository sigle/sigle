import { FastifyInstance } from 'fastify';
import { uintCV, cvToJSON, callReadOnlyFunction } from '@stacks/transactions';
import { prisma } from '../../../prisma';
import { config } from '../../../config';

interface SubscriptionCreatorPlusBody {
  nftId?: number;
}

interface SubscriptionCreatorPlusResponseError {
  error: string;
}

type SubscriptionCreatorPlusResponse = {
  id: string;
  nftId: number;
};
const analyticsReferrersResponseSchema = {
  description: 'Returns the newly created subscription object.',
  type: 'object',
  properties: {
    id: { type: 'string' },
    nftId: { type: 'number' },
  },
};

export async function createSubscriptionCreatorPlusEndpoint(
  fastify: FastifyInstance
) {
  return fastify.post<{
    Body?: SubscriptionCreatorPlusBody;
    Reply:
      | SubscriptionCreatorPlusResponseError
      | SubscriptionCreatorPlusResponse;
  }>(
    '/api/subscriptions/creatorPlus',
    {
      onRequest: [fastify.authenticate],
      config: {
        rateLimit: {
          max: config.NODE_ENV === 'test' ? 1000 : 5,
          timeWindow: 60000,
        },
      },
      schema: {
        description:
          'Create a creator plus subscription on the current logged in user. A user can only have one active subscription at a time.',
        tags: ['subscription'],
        body: {
          nftId: { type: 'number' },
        },
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
      const { nftId } = (req.body as SubscriptionCreatorPlusBody) || {};

      if (!nftId) {
        res.status(400).send({ error: 'nftId is required' });
        return;
      }
      if (typeof nftId !== 'number' || nftId < 0 || nftId > 3000) {
        res.status(400).send({ error: 'nftId is invalid' });
        return;
      }

      const result = await callReadOnlyFunction({
        contractAddress: 'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173',
        contractName: 'the-explorer-guild',
        functionName: 'get-owner',
        functionArgs: [uintCV(nftId)],
        network: 'mainnet',
        senderAddress: 'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173',
      });
      const resultJSON = cvToJSON(result);
      const nftOwnerAddress = resultJSON.value.value.value;

      if (nftOwnerAddress !== req.address) {
        res.status(400).send({ error: `NFT #${nftId} is not owned by user` });
        return;
      }

      const user = await prisma.user.findUniqueOrThrow({
        where: { stacksAddress: req.address },
      });

      let activeSubscription = await prisma.subscription.findFirst({
        select: {
          id: true,
          nftId: true,
        },
        where: {
          userId: user.id,
          status: 'ACTIVE',
        },
      });
      // When an active subscription is found, we just update the NFT linked to it.
      if (activeSubscription) {
        activeSubscription = await prisma.subscription.update({
          where: {
            id: activeSubscription.id,
          },
          data: {
            nftId,
          },
        });
      } else {
        activeSubscription = await prisma.subscription.create({
          data: {
            userId: user.id,
            status: 'ACTIVE',
            nftId,
          },
        });
      }

      res.status(200).send(activeSubscription);
    }
  );
}

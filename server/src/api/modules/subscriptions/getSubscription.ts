import { FastifyInstance } from 'fastify';
import { uintCV, cvToJSON, callReadOnlyFunction } from '@stacks/transactions';
import { prisma } from '../../../prisma';
import { config } from '../../../config';

interface GetSubscriptionResponseError {
  error: string;
}

type GetSubscriptionResponse = {
  id: string;
  nftId: boolean;
};
const analyticsReferrersResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
  },
};

export async function createGetSubscriptionEndpoint(fastify: FastifyInstance) {
  return fastify.get<{
    Reply:
      | SubscriptionCreatorPlusResponseError
      | SubscriptionCreatorPlusResponse;
  }>(
    '/api/subscriptions',
    {
      onRequest: [fastify.authenticate],
      config: {
        rateLimit: {
          max: config.NODE_ENV === 'test' ? 1000 : 5,
          timeWindow: 60000,
        },
      },
      schema: {
        response: {
          200: analyticsReferrersResponseSchema,
        },
      },
    },
    async (req, res) => {
      const nftId = req.body?.nftId;

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

      const user = await prisma.user.findUnique({
        where: { stacksAddress: req.address },
      });
      if (!user) {
        throw new Error(`User with address ${req.address} not found`);
      }

      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          status: 'ACTIVE',
        },
      });
      if (activeSubscription) {
        res.status(400).send({
          error: `User already has an active subscription`,
        });
        return;
      }

      await prisma.subscription.create({
        data: {
          userId: user.id,
          status: 'ACTIVE',
          nftId,
        },
      });

      res.status(200).send({ success: true });
    }
  );
}

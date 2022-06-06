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
  success: true;
};
const analyticsReferrersResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
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

      let user = await prisma.user.findUnique({
        where: { stacksAddress: req.address },
      });
      // For now we create the user when they enable their subscription.
      // Later this part will be moved on login after beta testing is done.
      if (!user) {
        user = await prisma.user.create({
          data: { stacksAddress: req.address },
        });
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

import { FastifyInstance } from 'fastify';

import { uintCV, cvToJSON, callReadOnlyFunction } from '@stacks/transactions';

interface SubscriptionCreatorPlusBody {
  nftId?: number;
}

interface SubscriptionCreatorPlusResponseError {
  error: string;
}

// TODO
type SubscriptionCreatorPlusResponse = {};
const analyticsReferrersResponseSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      domain: { type: 'string', nullable: true },
      count: { type: 'number' },
    },
  },
};

export async function createSubscriptionCreatorPlusEndpoint(
  fastify: FastifyInstance
) {
  return fastify.post<{
    Body: SubscriptionCreatorPlusBody;
    Reply:
      | SubscriptionCreatorPlusResponseError
      | SubscriptionCreatorPlusResponse;
  }>(
    '/api/subscriptions/creatorPlus',
    {
      onRequest: [fastify.authenticate],
      config: {
        rateLimit: {
          max: 5,
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
      // TODO logic should be to call the Hiro api to check that the wallet do own the NFT
      // TODO check that the NFT is not linked to another account
      // TODO create subscription and link it to the NFT id
      // const nftHoldings = nftApi.getNftHoldings({ principal: req.address });

      const { nftId } = req.body;

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

      console.log(resultJSON);

      res.status(200).send({});
    }
  );
}

import { FastifyInstance } from 'fastify';
import { NamesApi } from '@stacks/blockchain-api-client';
import { prisma } from '../../../prisma';

type GetUserMeResponse = {
  id: string;
  stacksAddress: string;
};
const getUserMeResponseSchema = {
  type: 'object',
  nullable: true,
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
        const stacksNamesApi = new NamesApi();
        const userNames = await stacksNamesApi.getNamesOwnedByAddress({
          address: req.address,
          blockchain: 'stacks',
        });
        const username = userNames.names[0];
        loggedInUser = await prisma.user.create({
          data: {
            stacksAddress: req.address,
            stacksUsername: username ? username : undefined,
          },
        });
      }

      return res.send(loggedInUser);
    }
  );
}

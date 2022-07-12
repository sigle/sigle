import { FastifyInstance } from 'fastify';
import { prisma } from '../../../prisma';

type GetUserByAddressResponse = {
  id: string;
  stacksAddress: string;
  subscription?: {
    id: string;
    nftId: number;
  };
} | null;
const getUserByAddressResponseSchema = {
  type: 'object',
  nullable: true,
  properties: {
    id: { type: 'string' },
    stacksAddress: { type: 'string' },
    subscription: {
      type: 'object',
      nullable: true,
      properties: {
        id: { type: 'string' },
        nftId: { type: 'number' },
      },
    },
  },
};

export async function createGetUserByAddressEndpoint(fastify: FastifyInstance) {
  return fastify.get<{
    Reply: GetUserByAddressResponse;
    Params: { userAddress: string };
  }>(
    '/api/users/:userAddress',
    {
      schema: {
        response: {
          200: getUserByAddressResponseSchema,
        },
      },
    },
    async (req, res) => {
      const { userAddress } = req.params;

      let user = await prisma.user.findUnique({
        where: { stacksAddress: userAddress },
        select: {
          id: true,
          stacksAddress: true,
          subscriptions: {
            select: {
              id: true,
              nftId: true,
            },
            where: {
              status: 'ACTIVE',
            },
            take: 1,
          },
        },
      });

      return res.send(
        user
          ? {
              id: user.id,
              stacksAddress: user.stacksAddress,
              subscription: user.subscriptions[0],
            }
          : null
      );
    }
  );
}

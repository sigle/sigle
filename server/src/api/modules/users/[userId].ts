import { FastifyInstance } from 'fastify';
import { getToken } from 'next-auth/jwt';
import { config } from '../../../config';
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
  required: ['id', 'stacksAddress'],
  properties: {
    id: { type: 'string' },
    stacksAddress: { type: 'string' },
    subscription: {
      type: 'object',
      nullable: true,
      required: ['id', 'nftId'],
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
        description: 'Return a user for a given stacks address.',
        tags: ['user'],
        params: {
          type: 'object',
          required: ['userAddress'],
          properties: {
            userAddress: { type: 'string' },
          },
        },
        response: {
          200: getUserByAddressResponseSchema,
        },
      },
    },
    async (req, res) => {
      const { userAddress } = req.params;

      const user = await prisma.user.findUnique({
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

      /**
       * If user is not found in database, it means it's a legacy user using blockstack connect.
       * As we can't create sessions for these kind of users, we check if the current user is logged in
       * and add the legacy user to the database if it's the case.
       */
      if (!user) {
        const token = await getToken({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          req: req as any,
          secret: config.NEXTAUTH_SECRET,
        });
        if (token && token.sub) {
          const newUser = await prisma.user.create({
            data: {
              stacksAddress: userAddress,
              isLegacy: true,
            },
          });
          return newUser;
        }
      }

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

import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextApiRequest, NextApiResponse } from 'next';
import { SiweMessage } from 'siwe';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { getCsrfToken } from 'next-auth/react';
import { SignInWithStacksMessage } from '@/lib/auth/sign-in-with-stacks/signInWithStacksMessage';
import { prismaClient } from '@/lib/prisma';
import { postHogClient } from '@/lib/posthog';

const authWalletSchema = z.object({
  chain: z.enum(['ethereum', 'stacks']),
  message: z.string(),
  signature: z.string(),
});

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Wallet',
      credentials: {
        chain: {
          label: 'Chain',
          type: 'text',
          placeholder: '0x0',
        },
        message: {
          label: 'Message',
          type: 'text',
          placeholder: '0x0',
        },
        signature: {
          label: 'Signature',
          type: 'text',
          placeholder: '0x0',
        },
      },
      async authorize(credentials, req) {
        const validationResult = authWalletSchema.safeParse(credentials);
        if (!validationResult.success) {
          return null;
        }
        const safeCredentials = validationResult.data;

        let address: string;

        try {
          if (safeCredentials.chain === 'ethereum') {
            const siwe = new SiweMessage(safeCredentials.message);
            const nextAuthUrl = new URL(process.env.NEXTAUTH_URL!);

            const result = await siwe.verify({
              signature: safeCredentials.signature,
              domain: nextAuthUrl.host,
              nonce: await getCsrfToken({ req }),
            });

            if (!result.success) {
              return null;
            }

            address = siwe.address.toLowerCase();
          } else {
            const siwe = new SignInWithStacksMessage(safeCredentials.message);

            const result = await siwe.verify({
              signature: safeCredentials.signature,
              domain: process.env.NEXTAUTH_URL,
              nonce:
                // In preview env, a different nonce is returned, to bypass this issue
                // we disable nonce check on preview pr
                process.env.VERCEL_ENV === 'preview'
                  ? undefined
                  : await getCsrfToken({ req }),
            });

            if (!result.success) {
              return null;
            }

            address = siwe.address;
          }
        } catch (error) {
          console.error(error);
          Sentry.withScope((scope) => {
            scope.setExtras({
              message: safeCredentials.message,
              signature: safeCredentials.signature,
            });
            Sentry.captureException(error);
          });
          return null;
        }

        let user = await prismaClient.user.findUnique({
          select: {
            id: true,
            did: true,
          },
          where: {
            address: address,
          },
        });

        if (!user) {
          user = await prismaClient.user.create({
            select: {
              id: true,
              did: true,
            },
            data: {
              address: address,
              did:
                safeCredentials.chain === 'ethereum'
                  ? `did:pkh:eip155:1:${address}`
                  : `did:pkh:stacks:1:${address}`,
              chain:
                safeCredentials.chain === 'ethereum' ? 'ETHEREUM' : 'STACKS',
            },
          });

          postHogClient.capture({
            distinctId: user.id,
            event: 'user created',
            properties: {
              did: user.did,
              chain: safeCredentials.chain,
            },
          });
          await postHogClient.shutdownAsync();
        }

        return {
          id: user.id,
          did: user.did,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      // Update the session to include some user information
      /* Step 1: update the token based on the user object */
      if (user) {
        token.did = user.did;
      }
      return token;
    },
    session({ session, token }) {
      /* Step 2: update the session.user based on the token object */
      if (token && session.user) {
        session.user.id = token.sub;
        session.user.did = token.did;
      }
      return session;
    },
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const isDefaultSigninPage =
    req.method === 'GET' && req.query.nextauth?.includes('signin');

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    authOptions.providers.pop();
  }

  return NextAuth(req, res, authOptions);
}

import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextApiRequest, NextApiResponse } from 'next';
import * as Sentry from '@sentry/nextjs';
import { getCsrfToken } from 'next-auth/react';
import { SignInWithStacksMessage } from '@/lib/auth/sign-in-with-stacks/signInWithStacksMessage';
import { prismaClient } from '@/lib/prisma';
import { postHogClient } from '@/lib/posthog';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Stacks',
      credentials: {
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
        try {
          const siwe = new SignInWithStacksMessage(credentials?.message || '');

          const result = await siwe.verify({
            signature: credentials?.signature || '',
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

          let user = await prismaClient.user.findUnique({
            select: {
              id: true,
              did: true,
            },
            where: {
              address: siwe.address,
            },
          });

          if (!user) {
            user = await prismaClient.user.create({
              select: {
                id: true,
                did: true,
              },
              data: {
                address: siwe.address,
                did: `did:pkh:stacks:1:${siwe.address}`,
                chain: 'STACKS',
              },
            });

            postHogClient.capture({
              distinctId: user.id,
              event: 'user created',
              properties: {
                did: user.did,
              },
            });
            await postHogClient.shutdownAsync();
          }

          return {
            id: user.id,
            did: user.did,
          };
        } catch (error) {
          console.error(error);
          Sentry.withScope((scope) => {
            scope.setExtras({
              message: credentials?.message,
              signature: credentials?.signature,
            });
            Sentry.captureException(error);
          });
          return null;
        }
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

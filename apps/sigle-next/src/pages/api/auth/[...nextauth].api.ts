import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import * as Sentry from '@sentry/nextjs';
import { getCsrfToken } from 'next-auth/react';
import { SignInWithStacksMessage } from '@/lib/auth/sign-in-with-stacks/signInWithStacksMessage';
import { prismaClient } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
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
              address: true,
            },
            where: {
              address: siwe.address,
            },
          });

          if (!user) {
            user = await prismaClient.user.create({
              select: {
                id: true,
                address: true,
              },
              data: {
                address: siwe.address,
                did: `did:pkh:stacks:1:${siwe.address}`,
                chain: 'STACKS',
              },
            });

            // TODO report to posthog that user is created
          }

          return {
            id: user.id,
            address: user.address,
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
        token.address = user.address;
      }
      return token;
    },
    session({ session, token }) {
      /* Step 2: update the session.user based on the token object */
      if (token && session.user) {
        session.user.id = token.sub;
        session.user.address = token.address;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);

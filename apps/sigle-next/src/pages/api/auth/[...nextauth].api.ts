import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import * as Sentry from '@sentry/nextjs';
import { getCsrfToken } from 'next-auth/react';
import { SignInWithStacksMessage } from '@/lib/auth/sign-in-with-stacks/signInWithStacksMessage';

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
        // TODO create user in db if not exists
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

          if (result.success) {
            return {
              id: siwe.address,
              address: siwe.address,
            };
          }
          return null;
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
        console.log('token', token);
      }
      return token;
    },
    session({ session, token }) {
      /* Step 2: update the session.user based on the token object */
      if (token && session.user) {
        session.user.address = token.address;
        console.log('session.user', session.user);
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);

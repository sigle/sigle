import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import * as Sentry from '@sentry/nextjs';
import { getCsrfToken } from 'next-auth/react';
import { SignInWithStacksMessage } from '@micro-stacks/client';

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

          console.log({ siwe: process.env.NEXTAUTH_URL });

          const result = await siwe.verify({
            signature: credentials?.signature || '',
            // TODO domain should be url - needs to be fixed in micro-stacks
            // domain: process.env.NEXTAUTH_URL,
            domain: 'Sigle',
            // TODO test that this is working
            nonce: await getCsrfToken({ req: req as any }),
          });

          if (result.success) {
            return {
              id: siwe.address,
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
};

export default NextAuth(authOptions);

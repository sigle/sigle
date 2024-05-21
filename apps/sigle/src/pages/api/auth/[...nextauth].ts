import { NextApiHandler } from 'next';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getCsrfToken } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import { SignInWithStacksMessage } from '../../../modules/auth/sign-in-with-stacks/signInWithStacksMessage';

const hostname = new URL(process.env.NEXTAUTH_URL || '').hostname;
const rootDomain = hostname.split('.').slice(-2).join('.');

const auth: NextApiHandler = async (req, res) => {
  const providers = [
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
      async authorize(credentials) {
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
            };
          }
          return null;
        } catch (error) {
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
  ];

  const isDefaultSigninPage =
    req.method === 'GET' && req.query.nextauth?.includes('signin');

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    providers.pop();
  }

  const useSecureCookies = process.env.NEXTAUTH_URL
    ? process.env.NEXTAUTH_URL.startsWith('https://')
    : false;
  const cookiePrefix = useSecureCookies ? '__Secure-' : '';

  return await NextAuth(req, res, {
    providers,
    session: {
      strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async session({ session, token }) {
        session.address = token.sub;
        return session;
      },
    },
    cookies: {
      sessionToken: {
        name: `${cookiePrefix}next-auth.session-token`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: useSecureCookies,
          /**
           * We take the default cookies from NextAuth and add our own
           * domain to allow cookies to be shared between subdomains.
           * Eg: https://app.sigle.io needs to be set to .sigle.io
           * Localhost and vercel preview env just use the hostname directly.
           */
          domain:
            hostname == 'localhost' || process.env.VERCEL_ENV === 'preview'
              ? hostname
              : '.' + rootDomain,
        },
      },
    },
  });
};

export default auth;

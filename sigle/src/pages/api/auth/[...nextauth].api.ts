import { NextApiHandler } from 'next';
import NextAuth from 'next-auth';
import { defaultCookies } from 'next-auth/core/lib/cookie';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getCsrfToken } from 'next-auth/react';
import { SignInWithStacksMessage } from '../../../modules/auth/sign-in-with-stacks/signInWithStacksMessage';

/**
 * We take the default cookies from NextAuth and add our own
 * domain to allow cookies to be shared between subdomains.
 * Eg: https://app.sigle.io needs to be set to .sigle.io
 */
let cookieRootDomain = process.env.NEXTAUTH_URL;
if (!cookieRootDomain) {
  throw new Error('NEXTAUTH_URL is not set');
}
const hostname = new URL(cookieRootDomain).hostname;
const rootDomain = hostname.split('.').slice(-2).join('.');
// add a . in front so that subdomains are included
cookieRootDomain = hostname == 'localhost' ? hostname : '.' + rootDomain;

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
            nonce: await getCsrfToken({ req }),
          });

          if (result.success) {
            return {
              id: siwe.address,
            };
          }
          return null;
        } catch (e) {
          return null;
        }
      },
    }),
  ];

  const isDefaultSigninPage =
    req.method === 'GET' && req.query.nextauth.includes('signin');

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    providers.pop();
  }

  const cookies = defaultCookies(
    process.env.NEXTAUTH_URL
      ? process.env.NEXTAUTH_URL.startsWith('https://')
      : false
  );

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
      ...cookies,
      sessionToken: {
        name: cookies.sessionToken.name,
        options: {
          ...cookies.sessionToken.options,
          domain: cookieRootDomain,
        },
      },
      csrfToken: {
        name: cookies.csrfToken.name,
        options: {
          ...cookies.csrfToken.options,
          domain: cookieRootDomain,
        },
      },
    },
  });
};

export default auth;

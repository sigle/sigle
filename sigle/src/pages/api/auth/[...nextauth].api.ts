import { NextApiHandler } from 'next';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getCsrfToken } from 'next-auth/react';
import { SignInWithStacksMessage } from '../../../modules/auth/sign-in-with-stacks/signInWithStacksMessage';

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
  });
};

export default auth;

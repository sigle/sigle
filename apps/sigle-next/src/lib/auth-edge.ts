// Copy paste of the auth.ts file to fix the following error:
// ./src/lib/sign-in-with-stacks/signInWithStacksMessage.ts
// Dynamic Code Evaluation (e. g. 'eval', 'new Function', 'WebAssembly.compile') not allowed in Edge Runtime
// Learn More: https://nextjs.org/docs/messages/edge-dynamic-code-evaluation

// The error was caused by importing '@stacks/transactions/dist/esm/index.js' in './src/lib/sign-in-with-stacks/signInWithStacksMessage.ts'.

// Import trace for requested module:
//   ./src/lib/sign-in-with-stacks/signInWithStacksMessage.ts
//   ./src/lib/sign-in-with-stacks/index.ts
//   ./src/lib/auth.ts
//   ./src/middleware.ts
import NextAuth from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      /** The user's stacks address. */
      address: string;
    };
  }

  interface User {
    /** The user's stacks address. */
    address: string;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    id: string;
    address: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // Set user fields during Sign in
        token.id = user.id!;
        token.address = user.address;
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          address: token.address,
        },
      };
    },
  },
  providers: [],
});

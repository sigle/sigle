import 'next-auth';

declare module 'next-auth' {
  interface User {
    did: string;
  }

  interface Session extends DefaultSession {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string;
    did: string;
  }
}

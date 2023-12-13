import 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    address: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string;
    did: string;
  }
}
